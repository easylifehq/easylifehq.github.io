import { useLocation, useNavigate } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { withReviewMode } from "@/features/coreloop/demo/reviewRoute";
import { DrinkEditorForm } from "@/features/easydrinks/components/DrinkEditorForm";
import { useEasyDrinks } from "@/features/easydrinks/EasyDrinksContext";
import { emptyDrinkDraft } from "@/features/easydrinks/domain/drinks";

export function EasyDrinkNewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addDrink } = useEasyDrinks();
  return <PageSection eyebrow="EasyDrinks" title="Add a drink" description="Save only the detail that will help you make or remember it again." headingLevel={1}><DrinkEditorForm initialDraft={emptyDrinkDraft()} submitLabel="Save drink" onSubmit={async (draft) => { const id = await addDrink(draft); navigate(withReviewMode(id ? `/app/easydrinks/${encodeURIComponent(id)}` : "/app/easydrinks", location.search)); }} onCancel={() => navigate(withReviewMode("/app/easydrinks", location.search))} /></PageSection>;
}
