// npm i gsap
import {
  Component,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  Inject,
  NgZone,
  PLATFORM_ID,
} from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

@Component({
  selector: "app-hero",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./hero.component.html",
  styleUrls: ["./hero.component.css"],
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild("section") section!: ElementRef<HTMLElement>;
  @ViewChild("headline") headline!: ElementRef<HTMLHeadingElement>;
  @ViewChild("subhead") subhead!: ElementRef<HTMLParagraphElement>;
  @ViewChild("ctaPrimary") ctaPrimary!: ElementRef<HTMLAnchorElement>;
  @ViewChild("ctaGhost") ctaGhost!: ElementRef<HTMLButtonElement>;
  @ViewChild("left") left!: ElementRef<HTMLDivElement>;

  showContact = false;

  private cleaners: Array<() => void> = [];
  private keydownHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape") this.zone.run(() => (this.showContact = false));
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone
  ) {}

  private get isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.zone.runOutsideAngular(() => {
      this.mountEntrance();
      this.mountSpotlight();
    });

    document.addEventListener("keydown", this.keydownHandler);
    this.cleaners.push(() =>
      document.removeEventListener("keydown", this.keydownHandler)
    );
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    this.cleaners.forEach((fn) => fn());
    this.cleaners = [];
    ScrollTrigger.getAll().forEach((s) => s.kill());

    const targets: HTMLElement[] = [
      this.headline?.nativeElement,
      this.subhead?.nativeElement,
      this.ctaPrimary?.nativeElement,
      this.ctaGhost?.nativeElement,
    ].filter(Boolean) as HTMLElement[];
    if (targets.length) gsap.killTweensOf(targets);
  }

  // UI
  toggleContact(ev: MouseEvent) {
    ev.stopPropagation();
    this.showContact = !this.showContact;
  }
  closeContact() {
    this.showContact = false;
  }

  // Animations
  private mountEntrance() {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (this.headline?.nativeElement)
      tl.from(this.headline.nativeElement, {
        y: 36,
        opacity: 0,
        duration: 0.8,
      });
    if (this.subhead?.nativeElement)
      tl.from(
        this.subhead.nativeElement,
        { y: 18, opacity: 0, duration: 0.6 },
        "-=0.35"
      );
    if (this.ctaPrimary?.nativeElement && this.ctaGhost?.nativeElement) {
      tl.from(
        [this.ctaPrimary.nativeElement, this.ctaGhost.nativeElement],
        {
          y: 10,
          opacity: 0,
          stagger: 0.08,
          duration: 0.45,
        },
        "-=0.25"
      );
    }
  }
  navOpen = false; // unused now, safe to remove later if you want
  activeId: "home" | "feature" | "skills" | "project" = "home";

  goTo(id: "home" | "feature" | "skills" | "project", ev?: Event) {
    if (ev) ev.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    this.activeId = id;
  }

  private mountSpotlight() {
    const el = this.left?.nativeElement;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty(
        "--mx",
        ((e.clientX - r.left) / r.width) * 100 + "%"
      );
      el.style.setProperty(
        "--my",
        ((e.clientY - r.top) / r.height) * 100 + "%"
      );
    };
    el.addEventListener("mousemove", onMove);
    this.cleaners.push(() => el.removeEventListener("mousemove", onMove));
  }
}
