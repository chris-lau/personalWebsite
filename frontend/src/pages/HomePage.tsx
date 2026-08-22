import { Link } from 'react-router-dom';
import { ArrowUpRight, Github, Linkedin } from 'lucide-react';
import { profileData } from '../data/profile';
import { projectsData } from '../data/projects';
import { experienceData } from '../data/experience';
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

export const HomePage = () => {
  const featuredProjects = FEATURED_PROJECT_ORDER
    .map((id) => projectsData.find((project) => project.id === id && project.featured))
    .filter((project): project is Project => Boolean(project));
  const chat = useChat();
  const currentRole = experienceData[0];

  return (
    <div className="page-container page-home">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">{profileData.name}</h1>
          <p className="hero-subtitle">{profileData.title}</p>
          <p className="hero-valueprop">
            Technical product leader in AI who actually builds the systems he ships — AI surveillance, agentic automation, and enterprise data acquisition.
          </p>
          <p className="hero-credentials">
            {profileData.location} &middot; {profileData.credentials}
          </p>

          <div className="hero-cta-row">
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

          <Link to="/experience" className="hero-role-band">
            <span className="hero-role-band__label">Currently</span>
            <span className="hero-role-band__role">{currentRole.role} @ {currentRole.company}</span>
            <span className="hero-role-band__highlight">{currentRole.highlights[0]}</span>
          </Link>
        </div>
      </section>

      <section className="chat-exhibit-section" aria-label="Ask this site chat exhibit">
        <BoxContainer title="ASK THIS SITE">
          <div className="chat-exhibit-intro">
            <div className="hero-grounding-badge">
              <span className="grounding-dot" aria-hidden="true" />
              <span>Grounded on Chris&apos;s live experience, projects &amp; architecture</span>
            </div>
            <p className="chat-exhibit-caption">
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
      </section>

      <section className="featured-section">
        <BoxContainer title="FEATURED PROJECTS">
          <div className="project-grid">
            {featuredProjects.map((project) => {
              const liveUrl = project.liveUrl ?? LIVE_DEMO_PATHS[project.id];
              return (
                <div key={project.id} className="project-card">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-desc">{project.description}</p>
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
                  <div className="project-actions">
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
                </div>
              );
            })}
          </div>
          <div className="section-footer">
            <Link to="/projects" className="link-button primary">View All Projects &rarr;</Link>
          </div>
        </BoxContainer>
      </section>
    </div>
  );
};
