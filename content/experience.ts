import { z } from "zod";
import { type Education, type Experience, educationSchema, experienceSchema } from "@/lib/schemas";

/**
 * The single timeline data file. Feeds /about, /resume, the years-of-experience figure
 * and the search index. Bullet wording is the résumé's unless noted; `source` records which
 * document carries the claim and `gate` holds back current-employer detail until approved.
 */
export const experience: Experience[] = z.array(experienceSchema).parse([
  {
    slug: "omega-permits",
    company: "Omega Permits",
    title: "Senior Software Engineer",
    location: "Lakeville, MA",
    period: { start: "2025-09", end: "present" },
    summary:
      "Designed and built an automated permit request pipeline for our clients, replacing slow manual steps with a more dependable digital workflow.",
    bullets: [
      {
        text: "Designed and delivered an automated permit request pipeline on a Node.js, Express, and PostgreSQL backend deployed across AWS EC2, RDS, S3, and SES, replacing a manual intake process of spreadsheets and email forwarding and cutting permit turnaround by an estimated 60% while freeing staff for higher-value compliance work.",
        source: "both",
        gate: "omega",
      },
      {
        text: "Engineered the notification layer as a Node.js cron service that tracks request milestones and expiration windows, deduplicates alerts, and sends consolidated emails through AWS SES, with timezone-safe date logic, failure alerting, and a dry-run mode for safe production testing.",
        source: "both",
        gate: "omega",
      },
      {
        text: "Configured production infrastructure end to end, including SSL through Let's Encrypt, S3 document storage tied to each permit record, RDS snapshot and restore procedures for disaster recovery, and a multi-branch staging workflow built on Git worktrees behind separate nginx-proxied instances.",
        source: "both",
        gate: "omega",
      },
      {
        text: "Lead architecture and development for a Node.js and PostgreSQL permit management platform on AWS serving multiple Massachusetts jurisdictions, setting engineering standards across the full stack, from database design through deployment and production operations.",
        source: "both",
        gate: "omega",
      },
      {
        text: "Led a security review of every public-facing endpoint and hardened input validation.",
        source: "both",
        gate: "security",
      },
    ],
    stack: ["Node.js", "Express", "PostgreSQL", "AWS", "React"],
  },
  {
    slug: "cloud-data-systems-raynham",
    company: "Cloud Data Systems",
    title: "Software Engineer",
    location: "Raynham, MA",
    period: { start: "2024-07", end: "2025-08" },
    summary:
      "Full-stack development on healthcare applications in a regulated clinical environment, across React Native, Next.js, Node.js and Spring Boot.",
    bullets: [
      {
        text: "Developed scalable full-stack applications using React Native, Next.js, Node.js, and Spring Boot, boosting UI responsiveness by 45% and cutting backend latency by 30%.",
        source: "both",
      },
      {
        text: "Integrated RESTful APIs and modular microservices into existing systems, resulting in a 30% drop in UI defects and a smoother dev-to-release cycle.",
        source: "both",
      },
      {
        text: "Architected reusable components and backend modules using Java and Spring to improve code maintainability and testability.",
        source: "resume",
      },
      {
        text: "Enhanced system stability through unit and integration tests with Jest, Selenium, and Karma, achieving 90%+ coverage and reducing production bugs by 40%.",
        source: "both",
      },
      {
        text: "Deployed Dockerized applications across Azure and AWS via Kubernetes, improving deployment speed by 35% and maintaining 99% service uptime.",
        source: "both",
      },
    ],
    stack: [
      "React Native",
      "Next.js",
      "Node.js",
      "Spring Boot",
      "Docker",
      "Kubernetes",
      "AWS",
      "Azure",
    ],
  },
  {
    slug: "nys-its",
    company: "NYS Office of Information Technology Services",
    title: "Software Engineer",
    location: "Albany, NY",
    period: { start: "2024-02", end: "2024-06" },
    summary:
      "Modernized legacy COBOL tax systems with modern C# and JavaScript front ends and built .NET services on AIX DB2 for real-time tax data processing.",
    bullets: [
      {
        text: "Modernized legacy COBOL systems by integrating modern C#/JavaScript frontends, enhancing performance by 30% and system interoperability.",
        source: "both",
      },
      {
        text: "Engineered secure .NET and AIX DB2 services for real-time tax data processing, improving SLA compliance by 25%.",
        source: "both",
      },
      {
        text: "Authored design documents and technical specs, reducing onboarding time for new devs and improving cross-team collaboration.",
        source: "both",
      },
      {
        text: "Provided Tier 2 technical support and resolved 95% of help desk requests within SLA, ensuring 98% availability for critical tax systems.",
        source: "both",
        resumeOnly: true,
      },
    ],
    stack: ["C#", ".NET", "JavaScript", "DB2", "COBOL (legacy)"],
  },
  {
    slug: "cloud-data-systems-albany",
    company: "Cloud Data Systems",
    title: "Software Engineer",
    location: "Albany, NY",
    period: { start: "2023-08", end: "2024-01" },
    displayStart: "2023",
    summary:
      "React Native, Next.js and TypeScript front ends paired with Spring Boot REST APIs, with OAuth2-secured services on MySQL.",
    bullets: [
      {
        text: "Built responsive and secure frontend applications with React Native, Next.js, and TypeScript, paired with robust REST APIs using Spring Boot.",
        source: "both",
      },
      {
        text: "Integrated OAuth2-secured backend services with MySQL, optimizing queries for performance gains of up to 25%.",
        source: "both",
      },
      {
        text: "Developed interactive UIs using JSP, jQuery, and HTML.",
        source: "both",
      },
      {
        text: "Applied Factory and Singleton patterns to keep the codebase modular.",
        source: "both",
      },
      {
        text: "Developed full-stack applications for clients across finance and retail, pairing React Native, Next.js, and TypeScript frontends with scalable Spring Boot and Node.js services, including dashboards that cut average task completion time by 40%.",
        source: "linkedin",
        gate: "albany",
      },
      {
        text: "Engineered CI/CD pipelines with GitHub Actions and Docker to automate testing and releases, and ran regular code reviews and QA collaboration that reduced production defects and improved deployment confidence.",
        source: "linkedin",
        gate: "albany",
      },
    ],
    stack: ["React Native", "Next.js", "TypeScript", "Spring Boot", "MySQL", "OAuth2"],
  },
  {
    slug: "maxis-software",
    company: "Maxis Software Pvt Ltd",
    title: "Java Full Stack Developer",
    location: "Hyderabad, India",
    period: { start: "2019-08", end: "2021-07" },
    summary:
      "Full-stack applications in Java, Spring MVC, Hibernate and MySQL, with REST APIs and AWS infrastructure.",
    bullets: [
      {
        text: "Developed full-stack applications using Java, Spring MVC, Hibernate, and MySQL, enhancing feature functionality by 40%.",
        source: "both",
      },
      {
        text: "Created dynamic web pages using JSP and JavaScript while developing REST APIs for seamless frontend-backend communication.",
        source: "both",
      },
      {
        text: "Set up scalable infrastructure on AWS (EC2, S3, RDS), supporting 24/7 availability and enabling real-time data access.",
        source: "both",
      },
    ],
    stack: ["Java", "Spring MVC", "Hibernate", "MySQL", "AWS"],
  },
]);

export const education: Education[] = z.array(educationSchema).parse([
  {
    slug: "ms-data-science",
    school: "University at Albany, SUNY",
    degree: "M.S. in Data Science",
    period: { start: "2021-08", end: "2023-05" },
    location: "Albany, NY",
  },
  {
    slug: "btech-cse",
    school: "KL University",
    degree: "B.Tech in Computer Science & Engineering",
    period: { start: "2017-07", end: "2021-04" },
    location: "India",
  },
]);
