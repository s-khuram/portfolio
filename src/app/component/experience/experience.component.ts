import {
  Component,
  AfterViewInit,
  OnInit,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  Inject,
  PLATFORM_ID,
  signal,
} from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";

type Experience = {
  role: string;
  company: string;
  period: string;
  bullets: string[];
};

type Meteor = {
  top: number;
  right: number;
  delay: number;
  duration: number;
  length: number;
};

@Component({
  selector: "app-experience",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./experience.component.html",
  styleUrls: ["./experience.component.css"],
})
export class ExperienceComponent implements OnInit, AfterViewInit {
  @ViewChild("progress", { static: true })
  progressRef!: ElementRef<HTMLDivElement>;
  @ViewChildren("card") cardRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren("dot") dotRefs!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren("meteor") meteorRefs!: QueryList<ElementRef<HTMLSpanElement>>;

  meteors: Meteor[] = [];
  maxBullets = 8;
  expanded = signal<Set<number>>(new Set());

  private isBrowser = false;
  private gsap!: any;
  private ScrollTrigger!: any;

  experiences: Experience[] = [
    {
      role: "Data Solution Architect",
      company: "MediTech",
      period: "03/2021 – Present",
      bullets: [
        "Led the architecture and deployment of a multi-cloud governance framework across AWS, Azure, and GCP, ensuring compliance with HIPAA, GDPR, and CCPA across 15 business domains.",
        "Built streaming pipelines with Kafka + Spark, handling 5M+ events/hour at sub-3 second latency for clinical exchanges and financial transactions.",
        "Designed and optimized Snowflake warehouses by implementing CDC pipelines (Snowpipe, Streams, Tasks) for real-time ingestion, reverse ETL, and partner data sharing (S3, SFTP, Epic EHR, Netsuite), reducing query costs by $1.2M annually.",
        "Created automated ingestion agents for more than 25 enterprise environments with secure and scalable EMR/PM data integration.",
        "Integrated ML-driven features into the platform to support personalized content delivery, increasing engagement by 25%.",
        "Drove Data Mesh adoption across multiple domains, reducing data-access bottlenecks by 40%.",
        "Authored more than 30 technical design documents to formalize standards, patterns, and architecture guidelines.",
        "Partnered with business stakeholders to align data strategy with corporate growth objectives, influencing $5M+ in operational efficiencies.",
        "Piloted GenAI-powered data enrichment workflows, improving customer insights and accelerating analytics delivery by 35%.",
        "Initiated an enterprise-wide self-service analytics framework, enabling 300+ users to access real-time insights without engineering bottlenecks.",
        "Orchestrated advanced cost-optimization strategies across multi-cloud environments, cutting infrastructure spend by 22%.",
        "Deployed GenAI workflows for fraud detection and patient enrichment, boosting insights accuracy by 30%.",
      ],
    },
    {
      role: "Senior Data Engineer Lead",
      company: "Trigent Software",
      period: "12/2016 – 02/2021",
      bullets: [
        "Engineered a hybrid cloud and on-prem data platform designed to handle more than 10TB of daily throughput using Spark, Kafka, and Databricks.",
        "Implemented Data Observability solutions such as Monte Carlo and Great Expectations, reducing data quality issues by 60%.",
        "Built resilient ETL pipelines using Delta Lake, Airflow, and Python to process over 5TB of data daily.",
        "Ensured zero data-loss tolerance through fault-tolerant ingestion architecture.",
        "Mentored six engineers and improved CI/CD deployment success rates from 70% to 98%.",
        "Migrated over 250 legacy ETL workflows into modular dbt and Airflow pipelines, reducing operational overhead by 70% and saving over $500K annually.",
        "Modernized real-time streaming architecture and reduced data latency from 10 minutes to under 1 minute with Kafka and Kubernetes.",
        "Automated deployment processes using Jenkins and GitHub Actions to enable fast and reliable multi-environment releases.",
        "Collaborated with data science teams to operationalize ML pipelines, reducing model deployment times by 50%.",
        "Developed a self-service analytics framework that empowered more than 100 business users with real-time data access.",
      ],
    },
    {
      role: "Data Engineer",
      company: "SumatoSoft",
      period: "08/2014 – 11/2016",
      bullets: [
        "Managed over 80+ complex ETL workflows using Informatica, SSIS, and Talend across multi-platform data warehouses including Oracle, SQL Server, and Snowflake.",
        "Designed reusable schema libraries supporting more than 40 datasets across multiple business units.",
        "Developed monitoring dashboards covering more than 300 batch jobs and increased SLA adherence from 85% to 99%.",
        "Introduced cost-optimization strategies that lowered cloud spending by 25%.",
        "Optimized SQL and PL/SQL queries across datasets containing more than 500M rows, reducing ETL runtimes by 40%.",
        "Created Power BI and Tableau dashboards for compliance, audits, and KPI reporting to support executive decision-making.",
        "Collaborated with cross-functional teams to define data quality metrics and reduced data-related incidents by 60%.",
        "Enhanced audit and compliance reporting by automating HIPAA and PHI tracking across healthcare pipelines.",
      ],
    },
    {
      role: "ETL & Data Warehouse Specialist",
      company: "10Pearls",
      period: "02/2013 – 07/2014",
      bullets: [
        "Constructed ETL workflows using Informatica and SSIS to process more than 500M records daily across retail and telecom data warehouses, while also building Epic Clarity and Caboodle healthcare integrations.",
        "Designed and implemented dimensional models such as Star Schema and Data Vault to support BI and analytics workloads.",
        "Improved query performance by 35% through model optimization and indexing strategies.",
        "Built early prototypes of data contracts that improved upstream and downstream dependency management by 30%.",
        "Streamlined batch job scheduling processes and eliminated 70% of manual operations in telecom billing.",
        "Tuned POS reporting queries and reduced runtime from 8 hours to just 1 hour.",
        "Secured all data pipelines to meet HIPAA, GDPR, and CCPA compliance requirements through IAM, encryption, and data masking, and standardized healthcare ETL pipelines using ICD-10, CPT, LOINC, and SNOMED coding frameworks.",
        "Transitioned BI workloads from SSRS to Tableau, increasing analyst adoption by 45%.",
        "Designed KPI dashboards for retail forecasting and churn prediction to provide actionable executive insights.",
      ],
    },
  ];

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // generate star field
    this.meteors = Array.from({ length: 24 }).map(() => ({
      top: this.rnd(0, 85),
      right: this.rnd(-10, 80),
      delay: this.rnd(0, 7),
      duration: this.rnd(7.5, 12.5),
      length: this.rnd(70, 140),
    }));
  }

  // --- lifecycle -------------------------------------------------------------

  ngOnInit(): void {
    // One-time normalization: collapse whitespace, strip duplicated A+A sentences, dedupe bullets
    this.experiences = this.experiences.map((xp) => ({
      ...xp,
      bullets: this.normalizeBullets(xp.bullets),
    }));
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) return;

    const mod = await import("gsap");
    this.gsap = (mod as any).gsap ?? mod;
    this.ScrollTrigger = (await import("gsap/ScrollTrigger")).ScrollTrigger;
    this.gsap.registerPlugin(this.ScrollTrigger);

    // Scroll progress along the timeline
    this.gsap.fromTo(
      this.progressRef.nativeElement,
      { height: "0%" },
      {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: "#experience",
          start: "top center+=40",
          end: "bottom center",
          scrub: true,
        },
      }
    );

    // Card reveal
    this.gsap.from(
      this.cardRefs.map((c) => c.nativeElement),
      {
        opacity: 0,
        y: 24,
        scale: 0.985,
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: "#experience",
          start: "top 80%",
          once: true,
        },
      }
    );

    // Pulse dots when each card scrolls in
    this.dotRefs.forEach((d) => {
      this.gsap.fromTo(
        d.nativeElement,
        { scale: 0.7, opacity: 0.5 },
        {
          scale: 1.1,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: { trigger: d.nativeElement, start: "top 85%" },
          yoyo: true,
          repeat: 1,
        }
      );
    });

    // Apply CSS variables for meteors
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

  // --- UI helpers ------------------------------------------------------------

  isExpanded(i: number): boolean {
    return this.expanded().has(i);
  }

  toggle(i: number): void {
    const next = new Set(this.expanded());
    next.has(i) ? next.delete(i) : next.add(i);
    this.expanded.set(next);
  }

  visibleBullets(i: number): string[] {
    const xp = this.experiences[i];
    if (!xp) return [];
    return this.isExpanded(i)
      ? xp.bullets
      : xp.bullets.slice(0, this.maxBullets);
  }

  trackByIndex = (idx: number) => idx;

  // --- data normalization ----------------------------------------------------

  private normalizeBullets(arr: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];

    for (let s of arr) {
      // collapse whitespace
      let t = s.replace(/\s+/g, " ").trim();

      // if string is exactly A + A (duplicated sentence concatenated)
      const half = Math.floor(t.length / 2);
      if (t.length % 2 === 0 && t.slice(0, half) === t.slice(half)) {
        t = t.slice(0, half).trim();
      }

      if (!seen.has(t)) {
        seen.add(t);
        out.push(t);
      }
    }
    return out;
  }

  // --- utils ----------------------------------------------------------------

  private rnd(min: number, max: number) {
    return +(Math.random() * (max - min) + min).toFixed(2);
  }
}
