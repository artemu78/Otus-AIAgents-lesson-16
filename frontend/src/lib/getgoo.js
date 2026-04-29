
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const getGoods = () => {

    // useEffect(() => {
    //   const fetchGoods = async () => {
    //     try {
    //       setLoading(true)
    //       const response = await fetch(`${SUPABASE_URL}/rest/v1/goods?select=*`, {
    //         headers: {
    //           'apikey': ANON_KEY,
    //           'Authorization': `Bearer ${ANON_KEY}`
    //         }
    //       })
    //       const data = await response.json()

    //       if (response.ok) {
    //         const mappedDresses = data.map(item => {
    //           // Helper to get category and icon based on title/description as fallback
    //           let category = item.category || 'all';
    //           if (category === 'all') {
    //             const title = (item.title || '').toLowerCase();
    //             const desc = (item.description || '').toLowerCase();
    //             const combined = `${title} ${desc}`;

    //             if (combined.includes('velvet') || combined.includes('gown') || combined.includes('night') || combined.includes('evening') || combined.includes('noir')) category = 'evening';
    //             else if (combined.includes('linen') || combined.includes('sun') || combined.includes('summer') || combined.includes('breeze') || combined.includes('azure')) category = 'summer';
    //             else if (combined.includes('denim') || combined.includes('casual') || combined.includes('cotton') || combined.includes('meadow')) category = 'casual';
    //             else if (combined.includes('shift') || combined.includes('pencil') || combined.includes('work') || combined.includes('structured')) category = 'workwear';
    //           }

    //           const iconMap = {
    //             'evening': '✦',
    //             'casual': '✿',
    //             'summer': '☀',
    //             'workwear': '💼',
    //             'all': '✧'
    //           };

    //           return {
    //             id: item.id,
    //             name: item.title,
    //             description: item.description,
    //             price: item.cost,
    //             category: category,
    //             icon: item.icon || iconMap[category] || '✧'
    //           };
    //         });
    //         setDresses(mappedDresses)
    //       }
    //     } catch (err) {
    //       console.error('Failed to fetch goods:', err)
    //     } finally {
    //       setLoading(false)
    //     }
    //   }

    //   fetchGoods()

    //   // Check if user is logged in via cookie
    //   const token = document.cookie.split('; ').find(row => row.startsWith('sb-access-token='))
    //   if (token) {
    //     const storedUser = localStorage.getItem('elise_user')
    //     if (storedUser) {
    //       setUser(JSON.parse(storedUser))
    //     }
    //   }
    // }, [])

    return fetchGoods();
    
    return new Promise((resolve) => {

        console.log("run promise");
        setTimeout(() => {
            console.log("timout is finished")
            resolve("🌟 Data fetched successfully after 1.5 seconds! (Using use())");
        }, 2500);
        
    });
}

const fetchGoods = async () => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/goods?select=*`, {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`
            }
        })

        if (response.ok) {
            return response.json();
        }
    } catch (err) {
        return Promise.reject(err);
    }
}

export const transformDresses = (data) => {
    return data.map(item => {
        // Helper to get category and icon based on title/description as fallback
        let category = item.category || 'all';
        if (category === 'all') {
            const title = (item.title || '').toLowerCase();
            const desc = (item.description || '').toLowerCase();
            const combined = `${title} ${desc}`;

            if (combined.includes('velvet') || combined.includes('gown') || combined.includes('night') || combined.includes('evening') || combined.includes('noir')) category = 'evening';
            else if (combined.includes('linen') || combined.includes('sun') || combined.includes('summer') || combined.includes('breeze') || combined.includes('azure')) category = 'summer';
            else if (combined.includes('denim') || combined.includes('casual') || combined.includes('cotton') || combined.includes('meadow')) category = 'casual';
            else if (combined.includes('shift') || combined.includes('pencil') || combined.includes('work') || combined.includes('structured')) category = 'workwear';
        }

        const iconMap = {
            'evening': '✦',
            'casual': '✿',
            'summer': '☀',
            'workwear': '💼',
            'all': '✧'
        };

        return {
            id: item.id,
            name: item.title,
            description: item.description,
            price: item.cost,
            category: category,
            icon: item.icon || iconMap[category] || '✧'
        };
    });
}

