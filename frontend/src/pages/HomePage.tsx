import { Link } from 'react-router-dom';
import { profileData } from '../data/profile';
import { projectsData } from '../data/projects';
import { skillsData } from '../data/skills';
import { BoxContainer } from '../components/ui/BoxContainer';
import { ChatPanel } from '../components/chat/ChatPanel';
import { HOME_STARTERS } from '../components/chat/starters';
import { useChat } from '../hooks/useChat';
import './Pages.css';

export const HomePage = () => {
  const featuredProjects = projectsData.filter((p) => p.featured);
  const chat = useChat();

  return (
    <div className="page-container page-home">
      <section className="hero-section">
        <BoxContainer title="ASK CHRIS">
          <div className="hero-content hero-content--chat">
            <h1 className="hero-title">{profileData.name}</h1>
            <p className="hero-subtitle">{profileData.title}</p>
            <p className="hero-bio hero-bio--short">{profileData.bio}</p>
          </div>
          <ChatPanel
            chat={chat}
            className="chat-panel--embedded"
            starterQuestions={HOME_STARTERS}
            greeting="Ask me anything about what Chris does — or tap a question below."
          />
          <div className="hero-links">
            {profileData.socials.map((s) => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-button"
              >
                {s.platform}
              </a>
            ))}
          </div>
        </BoxContainer>
        <div className="prefer-reading">
          <span className="prefer-reading__label">── or, prefer reading? ──</span>
          <nav className="prefer-reading__links" aria-label="Site sections">
            <Link to="/about">About</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/experience">Experience</Link>
            <Link to="/now">Now</Link>
          </nav>
        </div>
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
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="link-button">
                      Live Demo
                    </a>
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
