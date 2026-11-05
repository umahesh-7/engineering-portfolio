import { siteSchema } from "@/lib/schemas";

/**
 * Every sentence here traces to the owner's résumé or LinkedIn export, or to the
 * verified positioning copy in the plan. Items with a `gate` render only when the
 * matching flag below is true. See content/README.md before editing.
 */
export const site = siteSchema.parse({
  name: "Mahesh Utlapalli",
  initials: "MU",
  role: "Senior Software Engineer",
  employer: "Omega Permits",
  titleLine: "Senior Software Engineer · full-stack, backend, platform",
  seo: {
    title: "Mahesh Utlapalli · Senior Full-Stack Software Engineer",
    description:
      "Senior full-stack software engineer working across Node.js, React, PostgreSQL, AWS and CI/CD, building scalable systems for regulated industries.",
  },
  location: "Massachusetts, USA",
  links: {
    linkedin: "https://www.linkedin.com/in/umahesh",
    github: "https://github.com/umahesh-7",
    source: "https://github.com/umahesh-7/engineering-portfolio",
  },
  lastVerifiedAgainstLinkedIn: "2026-07-12",
  flags: {
    // Flip only with the owner's confirmation of Omega Permits' approval (plan question 4).
    omegaApproved: false,
    // Flip only with permission for the one-sentence security review mention (plan question 5).
    securityReviewApproved: false,
    // Flip when the LinkedIn-only Albany bullets are confirmed (plan question 7).
    albanyConfirmed: false,
    // Flip to show the explicit "open to roles" line on the hero (plan question 10).
    explicitAvailability: false,
  },
  availability: {
    neutral: "Senior Software Engineer at Omega Permits · Massachusetts, USA",
    explicit:
      "Open to Senior Software Engineer, Full Stack Engineer, Backend Engineer and Platform Engineer roles, especially where reliability, compliance and real impact matter.",
  },
  headline: {
    approved:
      "I turn manual processes into production systems, from database design to deployment.",
    fallback:
      "Senior full-stack engineer building and owning reliable systems for regulated industries.",
  },
  heroBio: {
    approved:
      "I'm a senior full-stack engineer building and owning reliable, secure systems for regulated industries. At Omega Permits I designed and shipped an automated permit pipeline that replaced spreadsheets and email forwarding and cut permit turnaround by an estimated 60%. Before that I built healthcare applications in daily clinical use and worked on New York State tax systems.",
    fallback:
      "I'm a senior full-stack engineer building and owning reliable, secure systems for regulated industries. At Omega Permits I designed and built an automated permit request pipeline for our clients, replacing slow manual steps with a more dependable digital workflow. Before that I built healthcare applications in daily clinical use and worked on New York State tax systems.",
  },
  heroCta: {
    primary: { label: "Read the case studies", href: "/projects" },
    secondary: { label: "Get in touch", href: "/contact" },
  },
  about: {
    intro:
      "I'm a Senior Software Engineer building full-stack software for industries where accuracy, reliability and trust matter. My experience spans government, healthcare and public-sector permitting, where software has to handle sensitive data, complex workflows and compliance requirements without adding unnecessary friction.",
    current: {
      approved:
        "At Omega Permits I designed and shipped an automated permit pipeline from the ground up on Node.js, Express, PostgreSQL and AWS. It replaced a manual intake process of spreadsheets and email forwarding, cutting permit turnaround by an estimated 60% and freeing staff for higher-value compliance work. I now lead architecture and development for a permit management platform serving multiple Massachusetts jurisdictions, from database design through deployment and production operations.",
      fallback:
        "As a Senior Software Engineer at Omega Permits, I work across Node.js, React, PostgreSQL and AWS on public-sector permitting software. I designed and built an automated permit request pipeline for our clients, replacing slow manual steps with a more dependable digital workflow.",
    },
    securitySentence:
      "I also led a security review of every public-facing endpoint and hardened input validation.",
    earlier:
      "Before Omega Permits, at Cloud Data Systems I worked on healthcare applications in daily clinical use, cutting backend latency by 30% and pushing test coverage past 90%, keeping critical applications stable under real clinical load. Before that, at the NYS Office of Information Technology Services, I integrated modern C# and JavaScript front ends with legacy COBOL tax systems. I hold an M.S. in Data Science from the University at Albany, SUNY (2023).",
  },
  pillars: [
    {
      pillar: "ui",
      title: "Front ends for the systems I build",
      blurb: [
        {
          text: "I build front ends in React Native, Next.js and TypeScript; that has included the React Native and Next.js healthcare applications in daily clinical use. Each result below links to a case study that says what changed and how it was measured.",
        },
      ],
      proofPoints: [
        {
          text: "Raised UI responsiveness by 45% through front-end optimization and backend restructuring on React Native and Next.js healthcare applications (Cloud Data Systems, Raynham, Jul 2024 – Aug 2025).",
          project: "clinical-performance-optimization",
        },
        {
          text: "This site: Next.js 16 App Router, an MDX content pipeline with a published-schema allowlist, filterable case studies, a print résumé, and Lighthouse and axe budgets enforced in CI.",
          project: "this-portfolio",
        },
        {
          text: "Built full-stack applications for finance and retail clients with React Native, Next.js and TypeScript front ends, including dashboards that cut average task completion time by 40% (Cloud Data Systems, Albany).",
          gate: "albany",
        },
        {
          text: "Improved cross-browser compatibility and accessibility scores in client audits on JSP and jQuery UIs (Cloud Data Systems, Albany).",
          gate: "albany",
        },
      ],
    },
    {
      pillar: "backend",
      title: "Backend systems designed to be operated, not just shipped",
      blurb: [
        {
          text: "I build backend services for workloads where correctness and uptime are the point: permit workflows for Massachusetts jurisdictions, healthcare applications in daily clinical use and, earlier, real-time processing of tax data.",
        },
        {
          text: "At Omega Permits the backend covers the permit request pipeline and its notification layer: data model, API, scheduled jobs, deduplicated alerting and outbound email. I also run the platform underneath it: TLS certificates, disaster recovery and multi-branch staging.",
          gate: "omega",
        },
      ],
      proofPoints: [
        {
          text: "Designed and delivered an automated permit pipeline on a Node.js, Express and PostgreSQL backend deployed across AWS EC2, RDS, S3 and SES, replacing a manual intake process and cutting permit turnaround by an estimated 60% (Omega Permits, Sep 2025 – present).",
          gate: "omega",
        },
        {
          text: "Engineered the notification layer as a Node.js cron service that tracks permit-request milestones and expiration windows, deduplicates alerts and sends consolidated emails through AWS SES, with timezone-safe date logic, failure alerting and a dry-run mode for safe production testing (Omega Permits, Sep 2025 – present).",
          gate: "omega",
        },
        {
          text: "Led a security review of every public-facing endpoint and hardened input validation (Omega Permits).",
          gate: "security",
        },
        {
          text: "Cut backend latency by 30% in a combined front-end optimization and restructuring of the Node.js and Spring Boot services behind healthcare applications (Cloud Data Systems, Raynham, Jul 2024 – Aug 2025).",
          project: "clinical-performance-optimization",
        },
        {
          text: "Integrated RESTful APIs and modular microservices into existing systems, cutting UI defects and smoothing the dev-to-release cycle (Cloud Data Systems, Raynham, Jul 2024 – Aug 2025).",
          project: "rest-api-microservices-integration",
        },
        {
          text: "Integrated OAuth2-secured backend services with MySQL and optimized queries for performance gains of up to 25% (Cloud Data Systems, Albany).",
          project: "oauth2-rest-apis-query-tuning",
        },
        {
          text: "Built .NET services on AIX DB2, with encryption and authentication, to process tax data in real time (NYS Office of Information Technology Services, Feb – Jun 2024).",
        },
      ],
    },
    {
      pillar: "fullstack",
      title: "The whole stack, owned well beyond the first release",
      blurb: [
        {
          text: "I work across the whole stack, pairing React Native and Next.js front ends with Node.js and Spring Boot services, and I stay accountable for how the result behaves once it is live. I treat automated tests, containerized deployment and CI/CD as part of delivery rather than a follow-up, and I set the standards that keep a codebase maintainable after launch.",
        },
      ],
      proofPoints: [
        {
          text: "Leading architecture and development for a Node.js and PostgreSQL permit management platform on AWS serving multiple Massachusetts jurisdictions, from database design through deployment and production operations (Omega Permits, Sep 2025 – present).",
          gate: "omega",
        },
        {
          text: "Configured production infrastructure end to end: TLS certificates from Let's Encrypt, S3 document storage tied to each permit record, RDS snapshot and restore procedures for disaster recovery, and a multi-branch staging workflow on Git worktrees behind separate nginx-proxied instances (Omega Permits, Sep 2025 – present).",
          gate: "omega",
        },
        {
          text: "Pushed unit and integration test coverage past 90% with Jest, Selenium and Karma on healthcare platforms, reducing production bugs by 40% (Cloud Data Systems, Raynham, Jul 2024 – Aug 2025).",
          project: "clinical-automated-testing",
        },
        {
          text: "Deployed Dockerized applications across Azure and AWS via Kubernetes, improving deployment speed and maintaining service uptime for applications in daily clinical use (Cloud Data Systems, Raynham, Jul 2024 – Aug 2025).",
          project: "cloud-native-migration-docker-kubernetes",
        },
        {
          text: "Integrated modern C# and JavaScript front ends with legacy COBOL tax systems (NYS Office of Information Technology Services, Feb – Jun 2024).",
        },
      ],
    },
  ],
  industries: [
    "Government (New York State tax systems)",
    "Healthcare (clinical applications)",
    "Public-sector permitting (Massachusetts jurisdictions)",
  ],
  certifications: [
    "Google Cloud Essentials",
    "BigQuery For Data Analysis",
    "Scientific Data Processing",
    "Python Data Structures",
    "Automation Anywhere Certified Advanced RPA Professional",
  ],
});
