import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { withReviewMode } from "@/features/coreloop/demo/reviewRoute";
import { DrinkEditorForm } from "@/features/easydrinks/components/DrinkEditorForm";
import { useEasyDrinks } from "@/features/easydrinks/EasyDrinksContext";
import type { DrinkDraft } from "@/lib/firestore/drinks";

export function EasyDrinkDetailPage() {
  const { drinkId = "" } = useParams(); const navigate = useNavigate(); const location = useLocation();
  const { drinks, isLoading, error, saveDrink, copyDrink } = useEasyDrinks(); const drink = drinks.find((entry) => entry.id === drinkId);
  if (isLoading) return <PageSection title="Loading drink…" headingLevel={1}><div className="empty-state" role="status">Opening the saved details.</div></PageSection>;
  if (error) return <PageSection title="This drink could not be loaded" headingLevel={1}><p className="error-copy">{error}</p><Link className="button-secondary" to={withReviewMode("/app/easydrinks", location.search)}>Return to saved drinks</Link></PageSection>;
  if (!drink) return <PageSection title="Drink not found" description="It may have been removed in another session, or the link may be incomplete." headingLevel={1}><Link className="button-secondary" to={withReviewMode("/app/easydrinks", location.search)}>Return to saved drinks</Link></PageSection>;
  const initialDraft: DrinkDraft = { name: drink.name, type: drink.type, baseServings: drink.baseServings, ingredients: drink.ingredients, steps: drink.steps.length ? drink.steps : [{ id: "step-1", text: "", durationSeconds: null }], instructions: drink.instructions, notes: drink.notes, rating: drink.rating, tags: drink.tags, date: drink.date, favorite: drink.favorite, sourceDrinkId: drink.sourceDrinkId };
  return <PageSection eyebrow="Saved drink" title={drink.name} description="Review the authored ingredients, servings, steps, optional flags, and notes. Nothing is inferred." headingLevel={1}><div className="toolbar-row"><Link className="button-primary compact-button" to={withReviewMode(`/app/easydrinks/${encodeURIComponent(drink.id)}/prepare`, location.search)}>Start guided preparation</Link><button type="button" className="button-secondary compact-button" onClick={() => void copyDrink(drink).then((id) => navigate(withReviewMode(id ? `/app/easydrinks/${encodeURIComponent(id)}` : "/app/easydrinks", location.search)))}>Duplicate drink</button><Link className="ghost-button compact-button" to={withReviewMode("/app/easydrinks", location.search)}>Back to Drinks</Link></div><DrinkEditorForm key={drink.updatedAt?.toISOString() || drink.id} initialDraft={initialDraft} submitLabel="Save changes" onSubmit={async (draft) => { await saveDrink(drink.id, draft); navigate(withReviewMode("/app/easydrinks", location.search)); }} onCancel={() => navigate(withReviewMode("/app/easydrinks", location.search))} /></PageSection>;
}
