export const ProductGrid = ({ loading, filteredDresses, setActiveFilter, addToCart }) => {
    return (
        <section className="products-section">
            <div className="products-grid">
                {loading ? (
                    <div className="loading-state">
                        <div className="loader"></div>
                        <p>Curating our collection...</p>
                    </div>
                ) : filteredDresses.length === 0 ? (
                    <div className="no-products">
                        <p>No products found</p>
                        <button className="clear-filter-btn" onClick={() => setActiveFilter('all')}>
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    filteredDresses.map(dress => (
                        <article key={dress.id} className="product-card">
                            <div className="product-image">
                                <span className="product-image-placeholder">{dress.icon}</span>
                                <span className="product-category-tag">
                                    {dress.category}
                                </span>
                            </div>
                            <div className="product-info">
                                <h3 className="product-name">{dress.name}</h3>
                                <p className="product-description">{dress.description}</p>
                                <div className="product-footer">
                                    <span className="product-price">${dress.price}</span>
                                    <button
                                        className="add-to-cart"
                                        onClick={() => addToCart(dress)}
                                    >
                                        Add to Bag
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </section>
    );
};
