import { useEffect } from "react";

const GoogleTranslate = () => {
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return; // Avoid duplicate script

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    window.googleTranslateElementInit = () => {
      if (!document.getElementById("google_translate_element").innerHTML.trim()) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,gu,ta,te,kn,bn,ml,mr,ur",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );
      }
    };
  }, []);

  return <div id="google_translate_element" style={{ margin: "1rem 0" }} />;
};

export default GoogleTranslate;