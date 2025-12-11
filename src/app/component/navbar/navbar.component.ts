import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ViewChildren,
  ElementRef,
  QueryList,
  Inject,
  NgZone,
  PLATFORM_ID,
  signal,
  WritableSignal,
} from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements AfterViewInit, OnDestroy {
  /** Buttons to render */
  @Input() items: Array<{ id: string; label: string }> = [
    { id: "home", label: "Home" },
    { id: "featured", label: "Feature" },
    { id: "skills", label: "Skills" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
  ];

  /** template refs (must exist in HTML) */
  @ViewChild("listWrap") listWrap!: ElementRef<HTMLDivElement>;
  @ViewChild("navList") navList!: ElementRef<HTMLUListElement>;
  @ViewChild("indicator") indicator!: ElementRef<HTMLSpanElement>;
  @ViewChildren("navBtn") navBtns!: QueryList<ElementRef<HTMLButtonElement>>;

  /** state */
  activeId: WritableSignal<string> = signal(this.items[0]?.id ?? "home");
  scrollProgress: WritableSignal<number> = signal(0);

  private isBrowser: boolean;
  private cleaners: Array<() => void> = [];

  constructor(@Inject(PLATFORM_ID) platformId: Object, private zone: NgZone) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    // observe sections to sync active pill
    this.zone.runOutsideAngular(() => this.observeSections());

    // keep underline aligned on resize/layout changes
    const ro = new ResizeObserver(() => this.positionIndicator());
    if (this.listWrap?.nativeElement) ro.observe(this.listWrap.nativeElement);
    this.cleaners.push(() => ro.disconnect());

    const sub = this.navBtns.changes.subscribe(() => this.positionIndicator());
    this.cleaners.push(() => sub.unsubscribe());

    // scroll progress + occasional reflow
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop || document.body.scrollTop;
      const height = doc.scrollHeight - doc.clientHeight || 1;
      this.scrollProgress.set(
        Math.max(0, Math.min(100, (scrolled / height) * 100))
      );
      this.positionIndicator();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    this.cleaners.push(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    });

    // first paint
    setTimeout(() => {
      this.positionIndicator();
      onScroll();
    });
  }

  ngOnDestroy(): void {
    this.cleaners.forEach((fn) => fn());
    this.cleaners = [];
  }

  /** click handler from template */
  goTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    this.activeId.set(id);
    this.positionIndicator();
  }

  /** underline alignment (uses wrapper, not <ul>) */
  private positionIndicator() {
    if (!this.indicator || !this.navList || !this.listWrap) return;

    const current = this.navBtns
      ?.toArray()
      .map((r) => r.nativeElement)
      .find((el) => el.getAttribute("data-id") === this.activeId());

    const bar = this.indicator.nativeElement;
    const wrap = this.listWrap.nativeElement;

    if (!current) {
      bar.style.opacity = "0";
      return;
    }

    const a = current.getBoundingClientRect();
    const b = wrap.getBoundingClientRect();

    bar.style.opacity = "1";
    bar.style.transform = `translateX(${a.left - b.left}px)`;
    bar.style.width = `${a.width}px`;
  }

  /** track which section is visible and set activeId */
  private observeSections() {
    const sections = this.items
      .map((it) => document.getElementById(it.id))
      .filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = visible[0]?.target?.id;
        if (id) this.zone.run(() => this.activeId.set(id));
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((s) => io.observe(s));
    this.cleaners.push(() => io.disconnect());
  }
}
