import React from 'react';
import { BookOpen, Crosshair, GraduationCap, Wrench } from 'lucide-react';
import { nowData } from '../data/now';
import { Section } from '../components/ui/Section';
import './Pages.css';

export const NowPage: React.FC = () => {
  return (
    <div className="page-container page-now">
      <section>
        <Section title="WHAT I'M DOING NOW" index="01">
          <p className="last-updated">Last Updated: {nowData.lastUpdated}</p>

          <div className="work-list">
            <article className="work-row">
              <div className="work-row__icon" aria-hidden="true">
                <Crosshair size={18} strokeWidth={1.75} />
              </div>
              <div className="work-row__body">
                <div className="work-row__titlerow">
                  <h3 className="work-row__title">Current Focus</h3>
                </div>
                <p className="work-row__desc">{nowData.currentFocus}</p>
              </div>
            </article>

            <article className="work-row">
              <div className="work-row__icon" aria-hidden="true">
                <Wrench size={18} strokeWidth={1.75} />
              </div>
              <div className="work-row__body">
                <div className="work-row__titlerow">
                  <h3 className="work-row__title">Working On</h3>
                </div>
                <ul className="work-row__highlights">
                  {nowData.workingOn.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>

            {nowData.reading.length > 0 && (
              <article className="work-row">
                <div className="work-row__icon" aria-hidden="true">
                  <BookOpen size={18} strokeWidth={1.75} />
                </div>
                <div className="work-row__body">
                  <div className="work-row__titlerow">
                    <h3 className="work-row__title">Currently Reading</h3>
                  </div>
                  <ul className="work-row__highlights">
                    {nowData.reading.map((book, i) => (
                      <li key={i}>{book}</li>
                    ))}
                  </ul>
                </div>
              </article>
            )}

            <article className="work-row">
              <div className="work-row__icon" aria-hidden="true">
                <GraduationCap size={18} strokeWidth={1.75} />
              </div>
              <div className="work-row__body">
                <div className="work-row__titlerow">
                  <h3 className="work-row__title">Learning</h3>
                </div>
                <ul className="work-row__highlights">
                  {nowData.learning.map((topic, i) => (
                    <li key={i}>{topic}</li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        </Section>
      </section>
    </div>
  );
};
