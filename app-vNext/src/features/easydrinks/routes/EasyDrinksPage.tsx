import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useAuth } from "@/features/auth/AuthContext";
import { withReviewMode } from "@/features/coreloop/demo/reviewRoute";
import { useEasyDrinks } from "@/features/easydrinks/EasyDrinksContext";
import { drinkTypeLabels, emptyDrinkDraft, filterDrinks } from "@/features/easydrinks/domain/drinks";
import { drinkTypes, type DrinkDraft, type DrinkType } from "@/lib/firestore/drinks";

export function EasyDrinksPage() {
  const { isDemoMode } = useAuth();
  const location = useLocation();
  const { drinks, isLoading, error, addDrink, saveDrink, copyDrink } = useEasyDrinks();
  const [quickDraft, setQuickDraft] = useState<DrinkDraft>(emptyDrinkDraft());
  const [query, setQuery] = useState("");
  const [type, setType] = useState<DrinkType | "all">("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [minimumRating, setMinimumRating] = useState(0);
  const [message, setMessage] = useState("");
  const filtered = useMemo(() => filterDrinks(drinks, { query, type, favoritesOnly, minimumRating }), [drinks, favoritesOnly, minimumRating, query, type]);
  const favoriteCount = drinks.filter((drink) => drink.favorite).length;
  const ratedCount = drinks.filter((drink) => drink.rating > 0).length;

  async function handleQuickCapture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!quickDraft.name.trim()) return;
    try {
      await addDrink(quickDraft);
      setQuickDraft(emptyDrinkDraft());
      setMessage(isDemoMode ? "Added to this synthetic demo only." : "Drink saved.");
    } catch (nextError) {
      setMessage(nextError instanceof Error ? nextError.message : "The drink could not be saved.");
    }
  }

  return (
    <PageSection eyebrow="EasyDrinks" title="A drink journal that stays light" description="Capture what you made, keep the useful recipe details, and find favorites without turning the moment into data entry." headingLevel={1}>
      {isDemoMode ? <div className="demo-data-banner"><strong>Synthetic demo</strong><span>Edits stay in this browser session and never write to production.</span></div> : null}
      {error ? <p className="error-copy" role="alert">{error}</p> : null}

      <section className="drink-quick-capture" aria-labelledby="quick-drink-title">
        <div><p className="eyebrow">Fast capture</p><h2 id="quick-drink-title">Save the drink now</h2><p>Start with the essentials. Add ingredients and notes from the detail screen whenever useful.</p></div>
        <form onSubmit={handleQuickCapture}>
          <label className="field-stack"><span>Name</span><input required value={quickDraft.name} onChange={(event) => setQuickDraft({ ...quickDraft, name: event.target.value })} placeholder="What did you make?" /></label>
          <label className="field-stack"><span>Type</span><select value={quickDraft.type} onChange={(event) => setQuickDraft({ ...quickDraft, type: event.target.value as DrinkType })}>{drinkTypes.map((entry) => <option key={entry} value={entry}>{drinkTypeLabels[entry]}</option>)}</select></label>
          <label className="field-stack"><span>Date</span><input type="date" value={quickDraft.date} onChange={(event) => setQuickDraft({ ...quickDraft, date: event.target.value })} /></label>
          <button className="button-primary">Save drink</button>
        </form>
        <div className="toolbar-row"><Link className="button-secondary compact-button" to={withReviewMode("/app/easydrinks/new", location.search)}>Add full recipe</Link>{message ? <span className="helper-copy" role="status">{message}</span> : null}</div>
      </section>

      <div className="drink-summary" aria-label="Drink library summary">
        <span><strong>{drinks.length}</strong> saved</span><span><strong>{favoriteCount}</strong> favorites</span><span><strong>{ratedCount}</strong> rated</span>
      </div>

      <section className="drink-library" aria-labelledby="drink-library-title">
        <div className="drink-library-heading"><div><p className="eyebrow">Library</p><h2 id="drink-library-title">Saved drinks</h2></div><Link className="button-primary compact-button" to={withReviewMode("/app/easydrinks/new", location.search)}>New drink</Link></div>
        <div className="drink-filters">
          <label className="field-stack drink-search"><span>Search</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, ingredient, note, or tag" /></label>
          <label className="field-stack"><span>Type</span><select value={type} onChange={(event) => setType(event.target.value as DrinkType | "all")}><option value="all">All types</option>{drinkTypes.map((entry) => <option key={entry} value={entry}>{drinkTypeLabels[entry]}</option>)}</select></label>
          <label className="field-stack"><span>Rating</span><select value={minimumRating} onChange={(event) => setMinimumRating(Number(event.target.value))}><option value={0}>Any rating</option><option value={3}>3+ stars</option><option value={4}>4+ stars</option><option value={5}>5 stars</option></select></label>
          <label className="drink-filter-check"><input type="checkbox" checked={favoritesOnly} onChange={(event) => setFavoritesOnly(event.target.checked)} /> Favorites only</label>
        </div>

        {isLoading ? <div className="empty-state" role="status"><strong>Loading saved drinks…</strong><p>Opening your private drink journal.</p></div> : null}
        {!isLoading && !drinks.length ? <div className="empty-state"><strong>Your first drink can be tiny.</strong><p>Save a name and type above. Ingredients, instructions, notes, tags, and ratings can come later.</p></div> : null}
        {!isLoading && drinks.length > 0 && !filtered.length ? <div className="empty-state"><strong>No drinks match these filters.</strong><p>Clear a filter or search for a broader ingredient or tag.</p><button type="button" className="button-secondary compact-button" onClick={() => { setQuery(""); setType("all"); setFavoritesOnly(false); setMinimumRating(0); }}>Clear filters</button></div> : null}
        <div className="drink-card-grid">
          {filtered.map((drink) => (
            <article className="drink-card" key={drink.id}>
              <div className="drink-card-top"><span className="chip-pill">{drinkTypeLabels[drink.type]}</span><button type="button" className="favorite-button" aria-label={drink.favorite ? `Remove ${drink.name} from favorites` : `Add ${drink.name} to favorites`} aria-pressed={drink.favorite} onClick={() => void saveDrink(drink.id, { ...drink, favorite: !drink.favorite })}>{drink.favorite ? "★" : "☆"}</button></div>
              <div><h3><Link to={withReviewMode(`/app/easydrinks/${encodeURIComponent(drink.id)}`, location.search)}>{drink.name || "Untitled drink"}</Link></h3><p>{drink.ingredients.length ? `${drink.ingredients.length} ingredient${drink.ingredients.length === 1 ? "" : "s"}` : "Recipe details not added"} · {drink.date}</p></div>
              {drink.tags.length ? <div className="drink-tags">{drink.tags.slice(0, 4).map((tag) => <span key={tag}>#{tag}</span>)}</div> : null}
              <div className="drink-card-bottom"><span aria-label={drink.rating ? `${drink.rating} out of 5 stars` : "Not rated"}>{drink.rating ? `${"★".repeat(drink.rating)}${"☆".repeat(5 - drink.rating)}` : "Not rated"}</span><button type="button" className="ghost-button compact-button" onClick={() => void copyDrink(drink).then(() => setMessage("A copy was saved with today's date."))}>Duplicate</button></div>
            </article>
          ))}
        </div>
      </section>
    </PageSection>
  );
}
