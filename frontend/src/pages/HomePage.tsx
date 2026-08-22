import { Link } from 'react-router-dom';
import { ArrowUpRight, Github, Linkedin } from 'lucide-react';
import { profileData } from '../data/profile';
import { projectsData } from '../data/projects';
import { skillsData } from '../data/skills';
import { experienceData } from '../data/experience';
import { BoxContainer } from '../components/ui/BoxContainer';
import { ChatPanel } from '../components/chat/ChatPanel';
import { HOME_STARTERS } from '../components/chat/starters';
import { useChat } from '../hooks/useChat';
import './Pages.css';

const SOCIAL_ICONS: Record<string, typeof Linkedin> = {
  LinkedIn: Linkedin,
  GitHub: Github,
};

export const HomePage = () => {
  const featuredProjects = projectsData.filter((p) => p.featured);
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

        <div className="hero-explore-dock">
          <span className="explore-dock__label">── or explore directly ──</span>
          <nav className="explore-dock__links" aria-label="Direct site exploration">
            <Link to="/about" className="explore-dock__link">About</Link>
            <Link to="/projects" className="explore-dock__link">Projects</Link>
            <Link to="/experience" className="explore-dock__link">Experience</Link>
            <Link to="/blog" className="explore-dock__link">Blog</Link>
            <Link to="/now" className="explore-dock__link">Now</Link>
            {profileData.socials.map((s) => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="explore-dock__link explore-dock__link--external"
              >
                {s.platform}
                <ArrowUpRight size={12} aria-hidden="true" className="external-icon" />
              </a>
            ))}
          </nav>
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
            {featuredProjects.map((project) => (
              <div key={project.id} className="project-card">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.description}</p>
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
                  {project.liveUrl && (
                    project.liveUrl.startsWith('/') ? (
                      <Link to={project.liveUrl} className="link-button">
                        Live Demo
                      </Link>
                    ) : (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="link-button">
                        Live Demo
                      </a>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="section-footer">
            <Link to="/projects" className="link-button primary">View All Projects &rarr;</Link>
          </div>
        </BoxContainer>
      </section>

      <section className="skills-summary-section">
        <BoxContainer title="SKILLS SNAPSHOT">
          <div className="skills-snapshot">
            {skillsData.map((cat) => (
              <div key={cat.category} className="skill-group">
                <span className="skill-cat-label">{cat.category}:</span>
                <div className="skill-chips">
                  {(cat.detailedSkills || cat.skills.map(s => ({ name: s, level: 'core' as const }))).map((skillItem) => {
                    const name = typeof skillItem === 'string' ? skillItem : skillItem.name;
                    const level = typeof skillItem === 'string' ? 'core' : (skillItem.level || 'core');
                    return (
                      <span
                        key={name}
                        className={`skill-chip ${level === 'core' ? 'skill-chip-core' : 'skill-chip-proficient'}`}
                        title={level === 'core' ? 'Core Expertise' : 'Proficient'}
                      >
                        {level === 'core' && <span className="skill-badge-dot" aria-hidden="true">★ </span>}
                        {name}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </BoxContainer>
      </section>
    </div>
  );
};
