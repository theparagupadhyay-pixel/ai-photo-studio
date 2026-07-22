import {
  ArrowRight,
  Image,
  Sparkles,
  WandSparkles,
  ScrollText,
  ShieldCheck,
  Zap,
} from "lucide-react";

function Home() {
  const openPage = (path) => {
    window.location.href = path;
  };

  return (
    <main className="ai-home">
      <nav className="ai-navbar">
        <div className="ai-logo">
          <span className="ai-logo-icon">
            <Sparkles size={22} />
          </span>

          <div>
            <strong>AI Photo Studio</strong>
            <small>Creative AI Tools</small>
          </div>
        </div>

        <div className="ai-nav-links">
          <button onClick={() => openPage("/photo-editor")}>
            Photo Editor
          </button>

          <button onClick={() => openPage("/prompt-generator")}>
            Prompt Generator
          </button>

          <button onClick={() => openPage("/script-generator")}>
            Script Generator
          </button>
        </div>
      </nav>

      <section className="ai-hero">
        <div className="ai-hero-content">
          <div className="ai-badge">
            <Zap size={16} />
            100% Free AI Creative Tools
          </div>

          <h1>
            Create better content with
            <span> powerful AI tools.</span>
          </h1>

          <p>
            Edit photos, generate professional prompts and create complete
            scripts from one modern AI workspace.
          </p>

          <div className="ai-hero-actions">
            <button
              className="ai-primary-button"
          onClick={() => openPage("/prompt-generator")}
            >
              Start creating
              <ArrowRight size={19} />
            </button>

            <button
              className="ai-secondary-button"
              onClick={() => openPage("/prompt-generator")}
            >
              Explore AI tools
            </button>
          </div>

          <div className="ai-trust-row">
            <span>
              <ShieldCheck size={17} />
              Free to use
            </span>

            <span>
              <Zap size={17} />
              Fast results
            </span>

            <span>
              <Sparkles size={17} />
              Modern AI tools
            </span>
          </div>
        </div>

        <div className="ai-hero-visual">
          <div className="ai-visual-glow"></div>

          <div className="ai-preview-card">
            <div className="ai-preview-top">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="ai-preview-image">
              <WandSparkles size={55} />
              <strong>Transform your ideas</strong>
              <p>Photo editing, prompts and scripts</p>
            </div>
          </div>

          <div className="ai-floating-card ai-floating-one">
            <Image size={20} />
            AI Photo Editor
          </div>

          <div className="ai-floating-card ai-floating-two">
            <Sparkles size={20} />
            Prompt Generator
          </div>
        </div>
      </section>

      <section className="ai-tools-section">
        <div className="ai-section-heading">
          <span>AI TOOLKIT</span>
          <h2>Everything you need to create</h2>
          <p>
            Select a tool and start creating professional content in seconds.
          </p>
        </div>

        <div className="ai-tools-grid">
          <article className="ai-tool-card">
            <div className="ai-tool-icon photo-icon">
              <Image size={28} />
            </div>

            <span className="ai-tool-label">PHOTO TOOL</span>

            <h3>AI Photoshop</h3>

            <p>
              Upload photos, enhance quality, apply effects, change background
              and export professional images.
            </p>

            <button onClick={() => openPage("/photo-editor")}>
              Open Photo Editor
              <ArrowRight size={18} />
            </button>
          </article>

          <article className="ai-tool-card featured-tool">
            <div className="ai-featured-tag">POPULAR</div>

            <div className="ai-tool-icon prompt-icon">
              <WandSparkles size={28} />
            </div>

            <span className="ai-tool-label">AI WRITING TOOL</span>

            <h3>AI Prompt Generator</h3>

            <p>
              Generate detailed prompts for images, videos, logos, products and
              social-media content.
            </p>

            <button onClick={() => openPage("/prompt-generator")}>
              Generate Prompt
              <ArrowRight size={18} />
            </button>
          </article>

          <article className="ai-tool-card">
            <div className="ai-tool-icon script-icon">
              <ScrollText size={28} />
            </div>

            <span className="ai-tool-label">CONTENT TOOL</span>

            <h3>AI Script Generator</h3>

            <p>
              Create YouTube, Reels, advertisement, story and video scripts in
              your preferred style.
            </p>

            <button onClick={() => openPage("/script-generator")}>
              Generate Script
              <ArrowRight size={18} />
            </button>
          </article>
        </div>
      </section>
    </main>
  );
}

export default Home;