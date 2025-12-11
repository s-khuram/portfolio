import {
  Component,
  AfterViewInit,
  ElementRef,
  QueryList,
  ViewChildren,
  ViewChild,
  Inject,
  PLATFORM_ID,
  signal,
  computed,
} from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";

type SkillGroup = { id: string; label: string; skills: string[] };
type Meteor = {
  top: number;
  left: number;
  delay: number;
  duration: number;
  length: number;
};

@Component({
  selector: "app-skill",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./skill.component.html",
  styleUrls: ["./skill.component.css"],
})
export class SkillComponent implements AfterViewInit {
  @ViewChild("panel", { static: true }) panelRef!: ElementRef<HTMLElement>;
  @ViewChild("chipGrid", { static: true })
  chipGridRef!: ElementRef<HTMLElement>;
  @ViewChildren("chip") chipRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren("tab") tabRefs!: QueryList<ElementRef<HTMLButtonElement>>;

  private isBrowser = false;
  private gsap!: any;
  private ScrollTrigger!: any;
  private Flip!: any;

  // ---------- DATA ----------
  private groupsData: SkillGroup[] = [
    {
      id: "programming",
      label: "Programming & Scripting",
      skills: [
        // High
        "Python",
        "SQL",
        "Scala",
        "Java",
        // Mid
        "C#",
        "Go",
        "Bash",
        "Shell scripting",
        ".NET",
        // Low
        "R",
        "Rust",
      ],
    },
    {
      id: "cloud",
      label: "Cloud Platforms",
      skills: [
        // High
        "AWS",
        "Azure",
        "GCP",
        "Databricks",
        // Mid (AWS)
        "S3",
        "Redshift",
        "Glue",
        "Lambda",
        "Kinesis",
        "Lake Formation",
        "CloudFormation",
        // Mid (Azure)
        "ADF",
        "Synapse",
        "ADLS",
        "Azure SQL",
        "Azure Monitor",
        "Functions",
        // Mid (GCP)
        "BigQuery",
        "Dataflow",
        "Dataproc",
        "Composer",
        "Pub/Sub",
        "Vertex AI",
      ],
    },
    {
      id: "bigdata",
      label: "Big Data & Streaming",
      skills: [
        // High
        "Spark (Batch & Streaming)",
        "Kafka",
        "Delta Lake",
        // Mid
        "Flink",
        "Beam",
        "Hadoop",
        "Hive",
        "Presto",
        // Low
        "Pulsar",
        "HDFS",
        "HBase",
        "Storm",
      ],
    },
    {
      id: "pipelines",
      label: "Data Engineering & Integration",
      skills: [
        // High
        "ETL/ELT",
        "dbt",
        "Airflow",
        "Azure Data Factory",
        // Mid
        "Informatica",
        "SSIS",
        "Apache NiFi",
        "Talend",
        // Low
        "Matillion",
        "Fivetran",
        "Stitch",
        "Prefect",
        "Dagster",
        "Luigi",
        "Pentaho",
        "Alteryx",
        "Real-Time Data Processing",
        "Pipeline Optimization",
        "Data Migration",
      ],
    },
    {
      id: "dwh",
      label: "Data Warehousing & Modeling",
      skills: [
        // High
        "Snowflake",
        "Redshift",
        "BigQuery",
        "Synapse",
        "Dimensional & Relational Modeling",
        "Star Schema",
        "Data Mesh",
        "Data Contracts",
        // Mid
        "Teradata",
        "Oracle",
        "SQL Server",
        "Vertica",
        "NoSQL",
        "Data Vault",
        "Parquet",
        "ORC",
        // Low
        "Data Fabric",
        "Reverse ETL",
      ],
    },
    {
      id: "mlops",
      label: "MLOps & Advanced Analytics",
      skills: [
        // High
        "MLflow",
        "Feature Stores",
        "LLMOps",
        "TensorFlow",
        "PyTorch",
        "Scikit-learn",
        // Mid
        "Kubeflow",
        "TensorFlow Extended (TFX)",
        "SageMaker Pipelines",
        "Vertex AI",
        // Low
        "Deep Learning (CNNs, RNNs)",
        "Reinforcement Learning",
      ],
    },
    {
      id: "devops",
      label: "DevOps & Automation",
      skills: [
        // High
        "Docker",
        "Kubernetes",
        "Terraform",
        "GitHub Actions",
        // Mid
        "Jenkins",
        "GitLab CI/CD",
        "Azure DevOps",
        "Helm",
        // Low
        "CircleCI",
        "Ansible",
        "GitOps",
        "Agile/Scrum",
        "Automated Testing & Monitoring",
      ],
    },
    {
      id: "gov",
      label: "Governance & Security",
      skills: [
        // High
        "HIPAA",
        "GDPR",
        "CCPA",
        "PHI",
        // Mid
        "IAM",
        "RBAC",
        "Encryption",
        "Data Masking",
        // Low
        "Data Catalogs (AWS Glue, Alation)",
        "Master Data Management (MDM)",
        "Data Observability",
        "Data Lineage",
        "Data Quality Management",
      ],
    },
    {
      id: "bi",
      label: "BI & Reporting",
      skills: [
        // High
        "Power BI",
        "Tableau",
        // Mid
        "Looker",
        "Superset",
        // Low
        "Mode Analytics",
        "SSAS",
        "SSRS",
        "Jupyter Notebooks",
        "Custom & Interactive Dashboards",
      ],
    },
    {
      id: "domains",
      label: "Domain Expertise",
      skills: [
        // High
        "Healthcare (EHR, HL7, Claims, Clinical Data Integration, Quality Measures)",
        "Finance (Budgeting, Forecasting, Financial Modeling, Risk Management, Variance Analysis, KPI Analysis, ROI)",
        // Mid
        "Insurance",
        // Low
        "Manufacturing",
        "Media/Entertainment",
      ],
    },
  ];

  groups = signal<SkillGroup[]>(this.groupsData);
  active = signal<string>("programming");

  allSkills = computed(() => {
    const set = new Set<string>();
    this.groups().forEach((g) => g.skills.forEach((s) => set.add(s)));
    return Array.from(set);
  });

  shownSkills = computed(() => {
    const id = this.active();
    if (id === "all") return this.allSkills();
    const g = this.groups().find((x) => x.id === id);
    return g ? g.skills : [];
  });

  // Title (no arrow fn in template)
  activeLabel = computed(() => {
    if (this.active() === "all") return "All Skills";
    const g = this.groups().find((gr) => gr.id === this.active());
    return g ? g.label : "Skills";
  });

  // Emoji icons for chips
  iconFor(name: string): string {
    const m: Record<string, string> = {
      Python: "🐍",
      SQL: "🧩",
      Scala: "📐",
      Java: "☕",
      "C#": "🔷",
      Go: "⚙️",
      Bash: "🐚",
      "Shell scripting": "🖥️",
      Snowflake: "❄️",
      Redshift: "🛰️",
      BigQuery: "📊",
      Synapse: "💠",
      Teradata: "📦",
      Oracle: "🏛️",
      "SQL Server": "🗄️",
      Vertica: "📈",
      NoSQL: "🗃️",
      "Dimensional Modeling": "📐",
      "Relational Modeling": "🔷",
      "Star Schema": "⭐",
      "Data Vault": "🗝️",
      "Data Mesh": "🕸️",
      "Data Contracts": "📜",
      "Data Fabric": "🧵",
      Parquet: "🪵",
      ORC: "📦",
      "Reverse ETL": "🔄",
      LLMOps: "🤖",
      HIPAA: "⚕️",
      GDPR: "📜",
      CCPA: "📝",
      PHI: "🩺",
      IAM: "🪪",
      RBAC: "🔐",
      "Data Masking": "🎭",
      Encryption: "🔒",
      "Data Catalogs": "📚",
      "Data Observability": "👀",
      Healthcare: "🏥",
      Insurance: "🛡️",
      Finance: "💹",
      Manufacturing: "🏭",
      "Media/Entertainment": "🎬",
      "ETL/ELT": "🔄",
      dbt: "🧱",
      Airflow: "🕑",
      "Spark (batch & streaming)": "⚡",
      Spark: "⚡",
      Kafka: "🌀",
      Databricks: "🔥",
      "Azure Data Factory": "🏗️",
      Informatica: "🧩",
      SSIS: "🧰",
      "Apache NiFi": "🌊",
      Talend: "⚙️",
      Matillion: "🟢",
      Fivetran: "🔗",
      Stitch: "🧵",
      Prefect: "✅",
      Dagster: "🧭",
      Luigi: "🎩",
      AWS: "☁️",
      S3: "🗂️",
      EMR: "🔥",
      Glue: "🧪",
      Lambda: "🪄",
      Kinesis: "💫",
      CloudFormation: "🧱",
      Azure: "💠",
      ADF: "🏗️",
      ADLS: "🗂️",
      "Azure SQL": "🗃️",
      "Azure Monitor": "👁️",
      Functions: "⚙️",
      GCP: "📡",
      Dataflow: "🌊",
      Dataproc: "🛠️",
      Composer: "🎼",
      "Pub/Sub": "📣",
      "Vertex AI": "🔺",
      MLflow: "🧪",
      Kubeflow: "🧬",
      Feast: "🍽️",
      "TensorFlow Extended (TFX)": "🧬",
      "SageMaker Pipelines": "🧪",
      "Feature Store": "🗂️",
      Flink: "🐟",
      Beam: "💡",
      Pulsar: "🌠",
      Hadoop: "🐘",
      Hive: "🐝",
      Presto: "🚀",
      "Delta Lake": "🏞️",
      Docker: "📦",
      Kubernetes: "🧭",
      Jenkins: "🤖",
      "GitHub Actions": "⚙️",
      "GitLab CI/CD": "🦊",
      "Azure DevOps": "💼",
      Terraform: "🏗️",
      Helm: "⛵",
      GitOps: "🔁",
      "Agile/Scrum": "🏃‍♂️",
      Tableau: "📈",
      "Power BI": "📊",
      Looker: "👀",
      Superset: "🧮",
      "Mode Analytics": "📊",
      SSAS: "🧠",
      SSRS: "📝",
    };
    return m[name] ?? "🔹";
  }

  // -------- Shooting stars --------
  meteors: Meteor[] = [];
  private rnd(min: number, max: number) {
    return +(Math.random() * (max - min) + min).toFixed(2);
  }

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    // generate star field
    this.meteors = Array.from({ length: 26 }).map(() => ({
      top: this.rnd(0, 85),
      left: this.rnd(-10, 80),
      delay: this.rnd(0, 7),
      duration: this.rnd(4.5, 9),
      length: this.rnd(60, 140),
    }));
  }

  // ---------- GSAP ----------
  async ngAfterViewInit() {
    if (!this.isBrowser) return;

    const mod = await import("gsap");
    this.gsap = mod.gsap ?? mod;
    this.ScrollTrigger = (await import("gsap/ScrollTrigger")).ScrollTrigger;
    this.Flip = (await import("gsap/Flip")).Flip;
    this.gsap.registerPlugin(this.ScrollTrigger, this.Flip);

    // initial reveal
    this.gsap.from(this.chipGridRef.nativeElement, {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: "power3.out",
      scrollTrigger: { trigger: "#skills", start: "top 80%", once: true },
      onComplete: () => this.staggerInChips(),
    });

    // pointer spotlight on panel
    const panel = this.panelRef.nativeElement;
    panel.addEventListener(
      "mousemove",
      (e) => {
        const r = panel.getBoundingClientRect();
        panel.style.setProperty("--mx", `${e.clientX - r.left}px`);
        panel.style.setProperty("--my", `${e.clientY - r.top}px`);
      },
      { passive: true }
    );
  }

  private staggerInChips() {
    this.gsap.from(
      this.chipRefs.map((c) => c.nativeElement),
      {
        y: 14,
        opacity: 0,
        stagger: 0.015,
        duration: 0.35,
        ease: "power2.out",
      }
    );
  }

  setActive(id: string) {
    if (!this.isBrowser) {
      this.active.set(id);
      return;
    }
    const state = this.Flip.getState(
      Array.from(this.chipGridRef.nativeElement.children)
    );
    this.active.set(id);
    queueMicrotask(() => {
      this.Flip.from(state, {
        duration: 0.55,
        ease: "power2.out",
        absolute: true,
        stagger: 0.01,
      });
      this.staggerInChips();
    });
  }
}
