const feedbackDocUrl =
  "https://docs.google.com/document/d/1zgdoY93Oitgh8GWNlFOCPsQePae8jYFRPOVdb2AHCUQ/edit?usp=drive_link";

export function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="Site feedback">
      <a href={feedbackDocUrl} target="_blank" rel="noopener noreferrer">
        Report a Bug / Suggest an Improvement
      </a>
    </footer>
  );
}
