import React, { useEffect, useState } from "react";
import { getTextOperations } from "../data/textUtils";
import DialogBox from "./DialogBox";
import Toolbar from "./Toolbar";
import Aos from "aos";
import { useTranslation } from "react-i18next";
import SummaryCard from "./SummaryCard";

const TextForm = (props) => {
  const [text, setText] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [dialogBoxOpen, setDialogBoxOpen] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [grammarResults, setGrammarResults] = useState([]);
  const [loadingGrammar, setLoadingGrammar] = useState(false);

  const fileInputRef = React.useRef();

  const { t } = useTranslation();

  useEffect(() => {
    Aos.refresh();
  }, [props.theme]);

  const handleChange = (e) => {
    setText(e.target.value);
    setPreviewText(e.target.value);
  };

  const handleFileImport = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target.result;
      setText(content);
      setPreviewText(content);
      props.showAlert(t("alerts.fileImported"), "success");
    };
    reader.onerror = () => {
      props.showAlert(t("alerts.fileError"), "error");
    };
    reader.readAsText(file, "utf-8");
  };

  const handleFileInputClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const textOperations = getTextOperations(
    text,
    setText,
    previewText,
    setPreviewText,
    setDialogBoxOpen,
    props,
    setGrammarResults,
    setLoadingGrammar,
    {
      isBold,
      setIsBold,
      isItalic,
      setIsItalic,
      isUnderline,
      setIsUnderline,
      isStrike,
      setIsStrike,
    },
    handleFileInputClick,
  );

  useEffect(() => {
    // When text becomes empty, reset formatting states
    if (!text.trim()) {
      setIsBold(false);
      setIsItalic(false);
      setIsUnderline(false);
      setIsStrike(false);
    }
  }, [text]);

  const buttonStyle = {
    color: props.theme === "light" ? "black" : "white",
    backgroundImage:
      props.theme === "light"
        ? "linear-gradient(135deg, #faffa3 0%, #f0f0a8 100%)"
        : `${props.colorTheme}`,
    filter: props.theme === "light" ? "none" : "brightness(140%)",
    fontWeight: props.theme === "light" ? 400 : 300,
    boxShadow: "2px 2px 8px rgba(0, 0, 0, 0.15)",
  };

  const getTopWords = (text) => {
    const words = text
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const freq = {};
    words.forEach((word) => {
      freq[word] = (freq[word] || 0) + 1;
    });

    const sortedWords = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    return sortedWords.slice(0, 5); // Limit to top 5 for display
  };

  const topWords = getTopWords(text);

  // FIX 1: Defined the missing `textDecoration` variable.
  // This function computes the correct CSS value based on the state.
  const getDecoration = () => {
    const decorations = [];
    if (isUnderline) decorations.push("underline");
    if (isStrike) decorations.push("line-through");
    return decorations.join(" "); // e.g., "underline line-through" or "underline"
  };
  const textDecoration = getDecoration();

  return (
    <section
      className={`min-h-screen py-8 ${props.theme === "light" ? "text-gray-900" : "text-white"
        }`}
    >
      <div className="container mx-auto px-8">
        <div className="lg:flex lg:gap-8 ">
          <div className="mb-6 lg:w-70/100" data-aos="fade-down" data-aos-duration="800">
            <h1 className="text-3xl font-bold mb-6">{t("textForm.title")}</h1>

            <Toolbar
              textOperations={textOperations}
              theme={props.theme}
              colorTheme={props.colorTheme}
              loadingGrammar={loadingGrammar}
              text={text}
              activeStyles={{
                Bold: isBold,
                Italic: isItalic,
                Underline: isUnderline,
                Strikethrough: isStrike,
              }}
            />

            <textarea
              className={`w-full p-4 h-[80%] rounded-lg border-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.theme === "light"
                ? "bg-white border-gray-300 text-gray-900"
                : "bg-gray-700 border-gray-500 text-white"
                }`}
              rows="10"
              value={text}
              onChange={handleChange}
              placeholder={t("textForm.placeholder")}
            ></textarea>

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              className="hidden"
              onChange={(e) =>
                handleFileImport(e.target.files && e.target.files[0])
              }
            />

            {/* Grammar results (inline, styled like Summary) - moved here to sit just below textarea and before function buttons */}
            {grammarResults && grammarResults.length > 0 && (
              <section data-aos="fade-up" data-aos-delay="200">
                <h2
                  className={`text-2xl sm:text-3xl font-bold mb-4 text-center tracking-tight ${props.theme === "light" ? "text-gray-800" : "text-gray-100"
                    }`}
                >
                  Grammar issues
                </h2>

                <div className="grid grid-cols-1 gap-4 mb-8">
                  <div className={`w-full p-4 rounded-xl border shadow-sm transition-all duration-300 ${props.theme === "light"
                    ? "bg-gradient-to-r from-yellow-200 to-yellow-300 border-yellow-400"
                    : "bg-gradient-to-r from-gray-800 to-gray-700 border-gray-700"
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                      <strong className="text-lg">Summary of Issues</strong>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{grammarResults.length} found</span>
                        <button
                          aria-label="Clear grammar issues"
                          onClick={() => setGrammarResults([])}
                          className="ml-2 text-sm font-medium px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {grammarResults.map((item, idx) => (
                        <div key={item.id || idx} className={`p-3 rounded-md border ${props.theme === 'light' ? 'border-blue-50' : 'border-gray-600'}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold">{item.message}</p>
                              {item.context && item.context.text && (
                                <p className="text-xs mt-1 text-gray-500">"{item.context.text}"</p>
                              )}
                              {item.replacements && item.replacements.length > 0 && (
                                <p className="text-xs mt-1 text-green-500">Suggestion: {item.replacements[0].value || item.replacements[0]}</p>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <button
                                onClick={() => setGrammarResults((prev) => prev.filter((_, i) => i !== idx))}
                                className="text-xs px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
          <div className="lg:w-30/100">
            <SummaryCard 
            theme={props.theme}
            t={t}
            text={text}
            topWords={topWords}
            previewText={previewText}
            isBold={isBold}
            isItalic={isItalic}
            isUnderline={isUnderline}
            isStrike={isStrike}
          />
          </div>
          
        </div>
        

        {/* FUNCTION BUTTONS */}
        <div
          className="flex flex-wrap gap-2 my-6"
          data-aos="fade-up"
          data-aos-delay="200"
          data-aos-duration="800"
        >
          {textOperations.map((op, i) =>
            op.id === "generate-lorem" ? (
              <div key={i} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // generate a random number between 1 and 10
                    const randomCount = Math.floor(Math.random() * 10) + 1;
                    op.func(randomCount);
                  }}
                  style={buttonStyle}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer`}
                >
                  {op.id === "grammar-check" && loadingGrammar ? t("textForm.checking") : op.label}
                </button>
              </div>
            ) : (
              // FIX 2: Corrected the malformed button with duplicate attributes.
              <button
                key={i}
                disabled={
                  (!(text && text.trim().length > 0) && !op.allowEmpty) ||
                  (op.id === "grammar-check" && loadingGrammar)
                }
                onClick={op.func}
                style={buttonStyle}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${(!(text && text.trim().length > 0) && !op.allowEmpty) ||
                  (op.id === "grammar-check" && loadingGrammar)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105 active:scale-95"
                  }`}
              >
                {op.id === "grammar-check" && loadingGrammar
                  ? "Checking..."
                  : op.label}
              </button>
            )
          )}
        </div>
      </div>

      

      {dialogBoxOpen && (
        <DialogBox
          setDialogBoxOpen={setDialogBoxOpen}
          setText={setText}
          setPreviewText={setPreviewText}
          showAlert={props.showAlert}
          theme={props.theme}
          question="Are you sure you want to clear all text?"
        />
      )}
    </section>
  );
};

export default TextForm;

// minimal propTypes stub to satisfy prop validation rules where configured
TextForm.propTypes = {};