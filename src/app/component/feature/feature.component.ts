import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChildren,
  ElementRef,
  QueryList,
  Inject,
  NgZone,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.css'],
})
export class FeatureComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('featCard') featCards!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('parallax') parallaxLayers!: QueryList<ElementRef<HTMLElement>>;

  private cleaners: Array<() => void> = [];
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.zone.runOutsideAngular(() => this.mountFeature());
  }

  ngOnDestroy(): void {
    this.cleaners.forEach((fn) => fn());
    this.cleaners = [];
    if (this.isBrowser) ScrollTrigger.getAll().forEach((s) => s.kill());
  }

  private mountFeature(): void {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cards: HTMLElement[] =
      this.featCards?.toArray().map((r) => r.nativeElement) ?? [];

    // Subtle entrance
    gsap.from(cards, {
      y: 28,
      opacity: 0,
      stagger: 0.12,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#featured', start: 'top 80%' },
    });

    // Hover interactions per card
    cards.forEach((card, i) => {
      const par = this.parallaxLayers.get(i)?.nativeElement ?? null;
      const glow = card.querySelector('.ambient-glow') as HTMLElement | null;
      const shine = card.querySelector('.shine') as HTMLElement | null;

      const onEnter = () => {
        if (prefersReduced) return;
        gsap.to(card, {
          duration: 0.35,
          ease: 'power3.out',
          rotateX: 4,
          rotateY: -4,
          z: 14,
          transformPerspective: 900,
        });
        if (glow)
          gsap.to(glow, { duration: 0.35, opacity: 1, scale: 1.03, ease: 'power3.out' });
        if (shine)
          gsap.fromTo(
            shine,
            { xPercent: -120, opacity: 0 },
            { xPercent: 180, opacity: 0.7, duration: 1.1, ease: 'power2.out' }
          );
      };

      const onMove = (e: MouseEvent) => {
        if (prefersReduced) return;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;

        // tilt
        const rotX = (py - 0.5) * 10;
        const rotY = (0.5 - px) * 10;
        gsap.to(card, {
          rotateX: rotX,
          rotateY: rotY,
          transformPerspective: 900,
          transformOrigin: 'center',
          duration: 0.16,
          ease: 'power2.out',
        });

        // parallax graphic
        if (par)
          gsap.to(par, {
            x: (px - 0.5) * 22,
            y: (py - 0.5) * -14,
            duration: 0.16,
            ease: 'power2.out',
          });

        // move glow focus point
        if (glow) {
          glow.style.setProperty('--mx', px * 100 + '%');
          glow.style.setProperty('--my', py * 100 + '%');
        }
      };

      const onLeave = () => {
        gsap.to(card, { duration: 0.5, ease: 'power3.out', rotateX: 0, rotateY: 0, z: 0 });
        if (par) gsap.to(par, { duration: 0.5, ease: 'power3.out', x: 0, y: 0 });
        if (glow) gsap.to(glow, { duration: 0.5, ease: 'power3.out', opacity: 0.85, scale: 1 });
      };

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);

      this.cleaners.push(() => {
        card.removeEventListener('mouseenter', onEnter);
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
      });
    });
  }
}
