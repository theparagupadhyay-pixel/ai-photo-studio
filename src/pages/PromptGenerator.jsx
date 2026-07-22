import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
  WandSparkles,
  RefreshCw,
} from "lucide-react";

const promptTypes = [
  "AI Image",
  "Product Photo",
  "Logo",
  "Poster",
  "Thumbnail",
  "Video",
  "Social Media",
];

const styles = [
  "Photorealistic",
  "Cinematic",
  "3D Render",
  "Anime",
  "Digital Art",
  "Luxury",
  "Minimal",
  "Cyberpunk",
];

const lightings = [
  "Natural sunlight",
  "Soft studio lighting",
  "Golden hour",
  "Dramatic lighting",
  "Neon lighting",
  "Moody shadows",
];

const cameraAngles = [
  "Eye level",
  "Close-up",
  "Wide angle",
  "Low angle",
  "Top view",
  "Portrait shot",
];

const aspectRatios = [
  "1:1 Square",
  "16:9 Landscape",
  "9:16 Portrait",
  "4:5 Instagram",
  "3:2 Photo",
];

function PromptGenerator() {
  const [type, setType] = useState("AI Image");
  const [subject, setSubject] = useState("");
  const [style, setStyle] = useState("Photorealistic");
  const [lighting, setLighting] = useState("Soft studio lighting");
  const [cameraAngle, setCameraAngle] = useState("Eye level");
  const [aspectRatio, setAspectRatio] = useState("1:1 Square");
  const [details, setDetails] = useState("");
  const [negativePrompt, setNegativePrompt] = useState(
    "blurry, low quality, distorted, watermark, extra fingers"
  );
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  const canGenerate = useMemo(
    () => subject.trim().length >= 3,
    [subject]
  );

  const generatePrompt = () => {
    if (!canGenerate) {
      return;
    }

    const detailText = details.trim()
      ? `Additional details: ${details.trim()}.`
      : "";

    const prompt = `${type} of ${subject.trim()}, ${style.toLowerCase()} style, ${lighting.toLowerCase()}, ${cameraAngle.toLowerCase()}, professional composition, highly detailed, sharp focus, realistic textures, balanced colors, premium quality, ${aspectRatio}. ${detailText} Negative prompt: ${negativePrompt}.`;

    setGeneratedPrompt(prompt);
    setCopied(false);
  };

  const copyPrompt = async () => {
    if (!generatedPrompt) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  const resetForm = () => {
    setType("AI Image");
    setSubject("");
    setStyle("Photorealistic");
    setLighting("Soft studio lighting");
    setCameraAngle("Eye level");
    setAspectRatio("1:1 Square");
    setDetails("");
    setNegativePrompt(
      "blurry, low quality, distorted, watermark, extra fingers"
    );
    setGeneratedPrompt("");
    setCopied(false);
  };

  return (
    <main className="prompt-page">
      <nav className="tool-navbar">
        <button
          className="tool-back-button"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          <ArrowLeft size={19} />
          Home
        </button>

        <div className="tool-brand">
          <span>
            <Sparkles size={21} />
          </span>

          <div>
            <strong>AI Prompt Generator</strong>
            <small>Free creative prompt builder</small>
          </div>
        </div>
      </nav>

      <section className="prompt-hero">
        <div className="prompt-hero-badge">
          <WandSparkles size={16} />
          FREE PROMPT GENERATOR
        </div>

        <h1>
          Create detailed prompts for
          <span> amazing AI results.</span>
        </h1>

        <p>
          Choose your style, lighting, camera angle and format. The tool will
          create a complete professional prompt for you.
        </p>
      </section>

      <section className="prompt-workspace">
        <div className="prompt-form-card">
          <div className="prompt-card-heading">
            <div>
              <span>STEP 1</span>
              <h2>Describe your idea</h2>
            </div>

            <button className="prompt-reset-button" onClick={resetForm}>
              <RefreshCw size={17} />
              Reset
            </button>
          </div>

          <label className="prompt-field">
            <span>Prompt type</span>

            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              {promptTypes.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="prompt-field">
            <span>Main subject or idea</span>

            <textarea
              rows="4"
              placeholder="Example: A futuristic sports car driving through Mumbai at night"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </label>

          <div className="prompt-two-column">
            <label className="prompt-field">
              <span>Visual style</span>

              <select
                value={style}
                onChange={(event) => setStyle(event.target.value)}
              >
                {styles.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="prompt-field">
              <span>Lighting</span>

              <select
                value={lighting}
                onChange={(event) => setLighting(event.target.value)}
              >
                {lightings.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="prompt-two-column">
            <label className="prompt-field">
              <span>Camera angle</span>

              <select
                value={cameraAngle}
                onChange={(event) => setCameraAngle(event.target.value)}
              >
                {cameraAngles.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="prompt-field">
              <span>Aspect ratio</span>

              <select
                value={aspectRatio}
                onChange={(event) => setAspectRatio(event.target.value)}
              >
                {aspectRatios.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="prompt-field">
            <span>Extra details</span>

            <textarea
              rows="3"
              placeholder="Colors, clothes, background, mood or other details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />
          </label>

          <label className="prompt-field">
            <span>Negative prompt</span>

            <textarea
              rows="3"
              value={negativePrompt}
              onChange={(event) =>
                setNegativePrompt(event.target.value)
              }
            />
          </label>

          <button
            className="prompt-generate-button"
            disabled={!canGenerate}
            onClick={generatePrompt}
          >
            <WandSparkles size={20} />
            Generate professional prompt
          </button>
        </div>

        <div className="prompt-result-card">
          <div className="prompt-card-heading">
            <div>
              <span>STEP 2</span>
              <h2>Generated prompt</h2>
            </div>
          </div>

          {generatedPrompt ? (
            <>
              <div className="generated-prompt-box">
                {generatedPrompt}
              </div>

              <button
                className="prompt-copy-button"
                onClick={copyPrompt}
              >
                {copied ? <Check size={19} /> : <Copy size={19} />}

                {copied ? "Copied successfully" : "Copy prompt"}
              </button>
            </>
          ) : (
            <div className="prompt-empty-result">
              <span>
                <Sparkles size={42} />
              </span>

              <h3>Your generated prompt will appear here</h3>

              <p>
                Fill in your idea and press the generate button.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default PromptGenerator;