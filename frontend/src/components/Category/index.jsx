export const Category = ({activeFilter, setActiveFilter}) => {
    return (
        <div className="category-filter">
            <button
                className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
            >
                All Pieces
            </button>
            <button
                className={`filter-button ${activeFilter === 'evening' ? 'active' : ''}`}
                onClick={() => setActiveFilter('evening')}
            >
                Evening
            </button>
            <button
                className={`filter-button ${activeFilter === 'casual' ? 'active' : ''}`}
                onClick={() => setActiveFilter('casual')}
            >
                Casual
            </button>
            <button
                className={`filter-button ${activeFilter === 'summer' ? 'active' : ''}`}
                onClick={() => setActiveFilter('summer')}
            >
                Summer
            </button>
            <button
                className={`filter-button ${activeFilter === 'workwear' ? 'active' : ''}`}
                onClick={() => setActiveFilter('workwear')}
            >
                Workwear
            </button>
        </div>
    )
}