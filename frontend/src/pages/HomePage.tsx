import { Link } from 'react-router-dom';
import { ArrowUpRight, Github, Linkedin } from 'lucide-react';
import { profileData } from '../data/profile';
import { projectsData } from '../data/projects';
import { experienceData } from '../data/experience';
import { skillsData } from '../data/skills';
import { nowData } from '../data/now';
import { Project } from '../types/portfolio';
import { BoxContainer } from '../components/ui/BoxContainer';
import { ChatPanel } from '../components/chat/ChatPanel';
import { HOME_STARTERS } from '../components/chat/starters';
import { useChat } from '../hooks/useChat';
import './Pages.css';

const SOCIAL_ICONS: Record<string, typeof Linkedin> = {
  LinkedIn: Linkedin,
  GitHub: Github,
};

/** Homepage display order for the featured project cards. */
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
    'A 0-100 Opportunity Score with FBA unit-economics simulation and competitor review-gap scanning.',
  'personal-os':
    "The site you're on: three themes, a live GitHub Activity Dashboard, and REST API integration.",
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

export const HomePage = () => {
  const chat = useChat();
  const currentRole = experienceData[0];
  const featuredProjects = FEATURED_PROJECT_ORDER
    .map((id) => projectsData.find((project) => project.id === id && project.featured))
    .filter((project): project is Project => Boolean(project));
  const allSkills = skillsData.flatMap((category) => category.skills);
  const toolchainSkills = TOOLCHAIN_SKILL_NAMES.filter((name) => allSkills.includes(name));

  // Cursor-responsive border gradient: feed the pointer position to the tile's glow.
  const handleTilePointer = (event: React.MouseEvent<HTMLElement>) => {
    const tile = event.currentTarget;
    const rect = tile.getBoundingClientRect();
    tile.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    tile.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  return (
    <div className="page-container page-home">
      <section className="home-hero">
        <div className="home-hero__content">
          <Link to="/experience" className="home-hero__status">
            <span className="home-hero__status-dot" aria-hidden="true" />
            <span className="home-hero__status-label">Currently</span>
            <span className="home-hero__status-role">
              {currentRole.role} @ {currentRole.company}
            </span>
          </Link>

          <h1 className="home-hero__title">{profileData.name}</h1>
          <p className="home-hero__subtitle">{profileData.title}</p>
          <p className="home-hero__valueprop">
            Technical product leader in AI who actually builds the systems he ships — AI
            surveillance, agentic automation, and enterprise data acquisition.
          </p>
          <p className="home-hero__meta">
            {profileData.location} &middot; {profileData.credentials}
          </p>

          <div className="home-hero__cta-row">
            <Link to="/experience" className="link-button primary">View Experience</Link>
            <a href={`mailto:${profileData.email}`} className="link-button">Get in Touch</a>
            {profileData.socials.map((social) => {
              const SocialIcon = SOCIAL_ICONS[social.platform];
              return (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-button hero-cta-social"
                >
                  {SocialIcon && <SocialIcon size={14} aria-hidden="true" />}
                  {social.platform}
                  <ArrowUpRight size={12} aria-hidden="true" className="external-icon" />
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-bento" aria-label="Highlights">
        <div className="bento-grid">
          <div className="bento-tile bento-tile--work" onMouseMove={handleTilePointer}>
            <BoxContainer title="FEATURED WORK">
              <div className="work-list">
                {featuredProjects.map((project) => {
                  const liveUrl = project.liveUrl ?? LIVE_DEMO_PATHS[project.id];
                  return (
                    <article key={project.id} className="work-card">
                      <h3 className="work-card__title">{project.title}</h3>
                      <p className="work-card__desc">{project.description}</p>
                      {PROJECT_OUTCOMES[project.id] && (
                        <p className="project-outcome">
                          <span className="project-outcome__arrow" aria-hidden="true">&rarr;</span>
                          {PROJECT_OUTCOMES[project.id]}
                        </p>
                      )}
                      <div className="tech-tags">
                        {project.techStack.map((tech) => (
                          <span key={tech} className="tech-tag">#{tech}</span>
                        ))}
                      </div>
                      <div className="work-card__actions">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="link-button">
                            GitHub
                          </a>
                        )}
                        {liveUrl && (
                          liveUrl.startsWith('/') ? (
                            <Link to={liveUrl} className="link-button">
                              Live Demo
                            </Link>
                          ) : (
                            <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="link-button">
                              Live Demo
                            </a>
                          )
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="section-footer">
                <Link to="/projects" className="link-button primary">View All Projects &rarr;</Link>
              </div>
            </BoxContainer>
          </div>

          <div id="ask-this-site" className="bento-tile bento-tile--chat" onMouseMove={handleTilePointer}>
            <BoxContainer title="ASK THIS SITE">
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
            </BoxContainer>
          </div>

          <div className="bento-tile bento-tile--stack" onMouseMove={handleTilePointer}>
            <BoxContainer title="TOOLCHAIN">
              <div className="stack-tags">
                {toolchainSkills.map((skill) => (
                  <span key={skill} className="tech-tag stack-tag">{skill}</span>
                ))}
              </div>
            </BoxContainer>
          </div>

          <div className="bento-tile bento-tile--now" onMouseMove={handleTilePointer}>
            <BoxContainer title="NOW">
              <p className="now-tile__focus">{nowData.currentFocus}</p>
              <ul className="now-tile__list">
                {nowData.workingOn.slice(0, NOW_TILE_ITEM_COUNT).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="now-tile__footer">
                <span className="now-tile__updated">Updated {nowData.lastUpdated}</span>
                <Link to="/now" className="link-button">More &rarr;</Link>
              </div>
            </BoxContainer>
          </div>
        </div>
      </section>
    </div>
  );
};
