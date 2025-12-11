import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChildren,
  QueryList,
  ViewChild,
  Inject,
  PLATFORM_ID,
} from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";

type Project = { title: string; bullets: string[]; company?: string };
type Meteor = {
  top: number;
  right: number;
  delay: number;
  duration: number;
  length: number;
};

@Component({
  selector: "app-project",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./project.component.html",
  styleUrls: ["./project.component.css"],
})
export class ProjectComponent implements AfterViewInit {
  private isBrowser = false;
  private gsap!: any;
  private ScrollTrigger!: any;

  @ViewChildren("card") cardRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild("footer", { static: true }) footerRef!: ElementRef<HTMLElement>;
  @ViewChildren("meteor") meteorRefs!: QueryList<ElementRef<HTMLSpanElement>>;

  currentYear = new Date().getFullYear();

  meteors: Meteor[] = [];
  projects: Project[] = [
    {
      title: "AI Feature Store & Vector Pipeline",
      bullets: [
        "Technologies: Databricks, Delta Lake, MLflow, Feast, Spark, Kafka.",
        "Built a centralized AI feature store with vector-ready pipelines enabling real-time fraud, churn, and personalization scoring.",
        "Improved ML feature accuracy by 18% and accelerated model iteration by 3x.",
      ],
    },
    {
      title: "Customer 360 Data Hub",
      bullets: [
        "Technologies: AWS Redshift, Snowflake, dbt, Airflow, S3, Python.",
        "Engineered a unified Customer 360 platform integrating 40+ CRM/POS/loyalty/eCommerce systems.",
        "Reduced marketing activation time from 3 days to 4 hours and enabled cross-domain analytics.",
      ],
    },
    {
      title: "Cross-Cloud Analytics Lakehouse",
      bullets: [
        "Technologies: BigQuery, Databricks, Delta Lake, Kafka, Terraform.",
        "Migrated siloed warehouses into a unified Delta Lakehouse architecture.",
        "Reduced query latency by 65% and storage costs by 40% while improving governance, lineage, and schema standardization.",
      ],
    },
    {
      title: "Real-Time Claims Streaming Platform",
      bullets: [
        "Technologies: Kafka, Databricks, Delta Live Tables, Spark Streaming, Event Hubs.",
        "Built near–real-time ingestion and enrichment pipelines for healthcare claims.",
        "Enabled sub-minute event processing and significantly improved alerting freshness and PHI-safe transformations.",
      ],
    },
    {
      title: "IoT Predictive Maintenance System",
      bullets: [
        "Technologies: Azure Data Explorer, Spark MLlib, Kafka, Kubernetes, ADLS.",
        "Developed streaming analytics for 500K+ IoT devices.",
        "Predicted equipment failures with 92% accuracy and reduced unplanned downtime by 30% through real-time model scoring.",
      ],
    },
  ];

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Generate a star field (top-right ➜ bottom-left)
    const rnd = (min: number, max: number) =>
      +(Math.random() * (max - min) + min).toFixed(2);
    this.meteors = Array.from({ length: 22 }).map(() => ({
      top: rnd(0, 85),
      right: rnd(-10, 80),
      delay: rnd(0, 7),
      duration: rnd(7.5, 12.5),
      length: rnd(70, 140),
    }));
  }
  trackByTitle = (_index: number, project: Project): string => project.title;

  async ngAfterViewInit() {
    if (!this.isBrowser) return;

    const mod = await import("gsap");
    this.gsap = mod.gsap ?? mod;
    this.ScrollTrigger = (await import("gsap/ScrollTrigger")).ScrollTrigger;
    this.gsap.registerPlugin(this.ScrollTrigger);

    // Card reveal
    this.gsap.from(
      this.cardRefs.map((c) => c.nativeElement),
      {
        opacity: 0,
        y: 22,
        scale: 0.985,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: "#projects", start: "top 80%", once: true },
      }
    );

    // Footer reveal
    this.gsap.from(this.footerRef.nativeElement, {
      opacity: 0,
      y: 14,
      duration: 0.45,
      ease: "power2.out",
      scrollTrigger: {
        trigger: this.footerRef.nativeElement,
        start: "top 85%",
        once: true,
      },
    });

    // Apply CSS vars to meteors (keeps HTML free of inline styles)
    const refs = this.meteorRefs.toArray();
    this.meteors.forEach((m, i) => {
      const el = refs[i]?.nativeElement;
      if (!el) return;
      el.style.setProperty("--top", `${m.top}%`);
      el.style.setProperty("--right", `${m.right}%`);
      el.style.setProperty("--len", `${m.length}px`);
      el.style.setProperty("--dur", `${m.duration}s`);
      el.style.setProperty("--delay", `${m.delay}s`);
    });
  }
}
