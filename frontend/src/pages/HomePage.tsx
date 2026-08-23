import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Bot, Github, Globe, Linkedin, ShoppingCart } from 'lucide-react';
import { profileData } from '../data/profile';
import { projectsData } from '../data/projects';
import { experienceData } from '../data/experience';
import { skillsData } from '../data/skills';
import { nowData } from '../data/now';
import { Project } from '../types/portfolio';
import { ChatPanel } from '../components/chat/ChatPanel';
import { HOME_STARTERS } from '../components/chat/starters';
import { useChat } from '../hooks/useChat';
import './Pages.css';

const SOCIAL_ICONS: Record<string, typeof Linkedin> = {
  LinkedIn: Linkedin,
  GitHub: Github,
};

/** Homepage display order for the featured work rows. */
const FEATURED_PROJECT_ORDER = ['multi-agent-system', 'amazon-seller-suite', 'personal-os'];

/** Homepage-only Live Demo destinations for projects without a liveUrl in projects.json. */
const LIVE_DEMO_PATHS: Record<string, string> = {
  'personal-os': '/how-this-site-works',
};

/** One-line outcomes, condensed from each project's backend description (no new claims). */
const PROJECT_OUTCOMES: Record<string, string> = {
  'multi-agent-system':
    'Multiple specialized AI agents orchestrated to address complex, cross-domain tasks.',
  'amazon-seller-suite':
    'A 0–100 Opportunity Score with FBA unit-economics simulation and competitor review-gap scanning.',
  'personal-os':
    "The site you're on: three themes, a live GitHub Activity Dashboard, and REST API integration.",
};

/** Domain icon shown in each work row's icon square. */
const PROJECT_ICONS: Record<string, typeof Bot> = {
  'multi-agent-system': Bot,
  'amazon-seller-suite': ShoppingCart,
  'personal-os': Globe,
};

/** Toolchain tile: hands-on engineering + AI skills, curated from skills.json (no new claims). */
const TOOLCHAIN_SKILL_NAMES = [
  'React',
  'TypeScript',
  'REST APIs & Architecture',
  'GraphDB & Database Modeling',
  'SaaS & Cloud Platforms',
  'AI Surveillance & Governance',
  'Agentic Automation',
  'Technology Roadmapping',
];

/** Now tile: top working-on items shown on the homepage. */
const NOW_TILE_ITEM_COUNT = 3;

/** Mono section label with index + hairline (Light Crisp section head). */
const SectionHead = ({ index, label }: { index: string; label: string }) => (
  <div className="home-section-head">
    <h2 className="home-section-head__title">{label}</h2>
    <span className="home-section-head__index">{index}</span>
    <span className="home-section-head__rule" aria-hidden="true" />
  </div>
);

export const HomePage = () => {
  const chat = useChat();
  const currentRole = experienceData[0];
  const featuredProjects = FEATURED_PROJECT_ORDER
    .map((id) => projectsData.find((project) => project.id === id && project.featured))
    .filter((project): project is Project => Boolean(project));
  const allSkills = skillsData.flatMap((category) => category.skills);
  const toolchainSkills = TOOLCHAIN_SKILL_NAMES.filter((name) => allSkills.includes(name));

  return (
    <div className="page-container page-home">
      <section className="home-hero">
        <div className="home-hero__status">
          <span className="home-hero__status-dot" aria-hidden="true" />
          <span>Currently — <strong>{currentRole.role} @ {currentRole.company}</strong></span>
        </div>

        <h1 className="home-hero__title">
          Technical product leader who builds the AI systems he ships.
        </h1>
        <p className="home-hero__lede">
          <strong>{profileData.name}</strong> — <span>{profileData.title}</span>.
          {' '}AI surveillance, agentic automation, and enterprise data acquisition —
          the rare PM who architects, codes, and ships.
        </p>
        <p className="home-hero__meta">
          {profileData.location} · {profileData.credentials}
        </p>

        <div className="home-hero__cta-row">
          <Link to="/experience" className="link-button primary">
            View Experience <ArrowRight size={13} aria-hidden="true" />
          </Link>
          <a href={`mailto:${profileData.email}`} className="link-button">Get in Touch</a>
          {profileData.socials.map((social) => {
            const SocialIcon = SOCIAL_ICONS[social.platform];
            return (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-button link-button--ghost hero-cta-social"
              >
                {SocialIcon && <SocialIcon size={14} aria-hidden="true" />}
                {social.platform}
                <ArrowUpRight size={12} aria-hidden="true" className="external-icon" />
              </a>
            );
          })}
        </div>
      </section>

      <section id="ask-this-site" className="home-section home-section--chat" aria-label="Ask this site">
        <SectionHead index="01" label="ASK THIS SITE" />
        <div className="home-chat__intro">
          <div className="home-chat__badge">
            <span className="grounding-dot" aria-hidden="true" />
            <span>Grounded on Chris&apos;s live experience, projects &amp; architecture</span>
          </div>
          <p className="home-chat__caption">
            This chat runs on a RAG backend I built over my own content — try it.
          </p>
        </div>
        <ChatPanel
          chat={chat}
          className="chat-panel--embedded"
          starterQuestions={HOME_STARTERS}
          greeting="Ask me anything about Chris's AI leadership, systems, and background — or tap a question below."
        />
      </section>

      <section className="home-section" aria-label="Featured work">
        <SectionHead index="02" label="FEATURED WORK" />
        <div className="work-list">
          {featuredProjects.map((project) => {
            const liveUrl = project.liveUrl ?? LIVE_DEMO_PATHS[project.id];
            return (
              <article key={project.id} className="work-row">
                <div className="work-row__icon" aria-hidden="true">
                  {(() => {
                    const ProjectIcon = PROJECT_ICONS[project.id] ?? Globe;
                    return <ProjectIcon size={18} strokeWidth={1.75} />;
                  })()}
                </div>
                <div className="work-row__body">
                  <div className="work-row__titlerow">
                    <h3 className="work-row__title">{project.title}</h3>
                    {project.id === 'personal-os' && (
                      <span className="work-row__badge">YOU ARE HERE</span>
                    )}
                    {project.id === 'amazon-seller-suite' && (
                      <span className="work-row__badge">LIVE DEMO</span>
                    )}
                  </div>
                  <p className="work-row__desc">{project.description}</p>
                  {PROJECT_OUTCOMES[project.id] && (
                    <p className="project-outcome">
                      <span className="project-outcome__arrow" aria-hidden="true">→</span>
                      {PROJECT_OUTCOMES[project.id]}
                    </p>
                  )}
                </div>
                <div className="work-row__side">
                  <div className="tech-tags">
                    {project.techStack.map((tech) => (
                      <span key={tech} className="tech-tag">#{tech}</span>
                    ))}
                  </div>
                  <div className="work-row__actions">
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="link-button">
                        GitHub <ArrowUpRight size={13} aria-hidden="true" />
                      </a>
                    )}
                    {liveUrl && (
                      liveUrl.startsWith('/') ? (
                        <Link to={liveUrl} className="link-button">
                          Live Demo <ArrowRight size={13} aria-hidden="true" />
                        </Link>
                      ) : (
                        <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="link-button">
                          Live Demo <ArrowRight size={13} aria-hidden="true" />
                        </a>
                      )
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="home-section home-panels" aria-label="Now and toolchain">
        <div className="home-panel">
          <SectionHead index="03" label="NOW" />
          <ul className="now-tile__list">
            {nowData.workingOn.slice(0, NOW_TILE_ITEM_COUNT).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="now-tile__footer">
            <span className="now-tile__updated">UPDATED {nowData.lastUpdated.toUpperCase()}</span>
            <Link to="/now" className="link-button">
              More <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="home-panel">
          <SectionHead index="04" label="TOOLCHAIN" />
          <div className="stack-tags">
            {toolchainSkills.map((skill) => (
              <span key={skill} className="tech-tag stack-tag">{skill}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
