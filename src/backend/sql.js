/**************************************
 * 
 * sql.js
 * 
 * This file contains parameterized SQL
 * statements that are used by the end-
 * points
 * 
 **************************************/
module.exports = {

    // SQL used by empty route "/"
    all_franchise_names: `
    SELECT
        object_construct('franchise_id', o.franchise_id, 'truck_brands', array_agg(distinct o.truck_brand_name)) as franchise
    FROM ORDERS o
    GROUP BY o.franchise_id
    ORDER BY o.franchise_id, COUNT(o.order_id) DESC;
    `,

    // SQL used by route "franchise/:franchise/"
    trucks_by_franchise: `
    SELECT
        array_agg(distinct o.truck_brand_name) as truck_brand_names,
        min(order_ts) as start_date, 
        max(order_ts) as end_date 
    FROM ORDERS o
    WHERE o.franchise_id = :1
    ORDER BY o.truck_brand_name;
    `,

    // SQL used by route /:franchise/countries/
    // 4.3.3 Update SQL for Top selling countries for franchise
    top_10_countries: `
    -- Top 10 Countries
    SELECT
        TOP 10 country,
        sum(price) AS revenue
    FROM
        app.orders
    WHERE
        franchise_id = :1
        AND date(order_ts) >= :2
        AND date(order_ts) <= :3
    GROUP BY
        country
    ORDER BY
        sum(price) desc;
    `,

    // SQL used by route /:franchise/trucks/:truckbrandname/sales_topitems
    // 4.3.5 Update SQL for Top selling items by truck
    top_selling_items_by_truck: `
    SELECT
        menu_item_name,
        sum(price) AS revenue
    FROM
        app.orders
    WHERE
        franchise_id = :1
        AND date(order_ts) >= :2
        AND date(order_ts) <= :3
        AND truck_brand_name = :4
    GROUP BY
        menu_item_name
    ORDER BY
        sum(price) desc;
    `,
    

    // SQL used by route /:franchise/trucks/
    // Top 10 trucks for franchise
    top_10_trucks: `
    SELECT
        TOP 10 truck_brand_name,
        sum(price) AS revenue
    FROM
        app.orders
    WHERE
        date(order_ts) >= :2
        AND date(order_ts) <= :3
        AND franchise_id = :1
    GROUP BY
        truck_brand_name
    ORDER BY
        sum(price) desc;
    `,

    // SQL used by route /:franchise/revenue/:year
    // Revenue by country for a franchise
    ytd_revenue_by_country: `
    -- Revenue for Year by Country
    -- The year is intentionally hardcoded here to show the entire years worth of data 
    SELECT
        country,
        month(order_ts) as date,
        sum(price) AS revenue
    FROM
        app.orders
    WHERE
         year(order_ts) = :2
        AND franchise_id = :1
    GROUP BY
        country,
        month(order_ts)
    ORDER BY
        sum(price) desc;
    `,

    // SQL used by route /:franchise/trucks/:truckbrandname/sales_dayofweek
    // Revenue by day of week for a franchise and truck brand
    sales_by_day_of_week: `
    -- Top Selling Items by Day of Week
    SELECT
        dayofweek(order_ts) as DoW,
        sum(price) AS revenue
    FROM
        app.orders
    WHERE
        date(order_ts) >= :2
        AND date(order_ts) <= :3
        AND truck_brand_name = :4
        AND franchise_id = :1
    GROUP BY
        dayofweek(order_ts)
    ORDER BY
        dayofweek(order_ts),
         sum(price) desc;
    `,

    // SQL used by route /:franchise/trucks/:truckbrandname/sales_topitems_dayofweek
    // Top selling items by day of week for a franchise and truck brand
    top_selling_items_by_day_of_week: `
    -- Top Selling Items by Day of Week
    SELECT
        dayofweek(order_ts) as DoW,
        menu_item_name,
        sum(price) AS revenue
    FROM
        app.orders
    WHERE
        date(order_ts) >= :2
        AND date(order_ts) <= :3
        AND truck_brand_name = :4
        AND franchise_id = :1
    GROUP BY
        dayofweek(order_ts),
        menu_item_name
    ORDER BY
        dayofweek(order_ts),
         sum(price) desc;
    `,

    // SQL used by route /:franchise/trucks/:truckbrandname/locations
    // Top selling locations for a franchise and truck brand
    best_cities_by_day_ofweek: `
    --  Top Cities by DoW
    SELECT
        dayofweek(order_ts) as DoW,
        primary_city,
        sum(price) AS revenue
    FROM
        app.orders
    WHERE
        date(order_ts) >= :2
        AND date(order_ts) <= :3
        AND truck_brand_name = :4
        AND franchise_id = :1
    GROUP BY
        dayofweek(order_ts),
        primary_city
    ORDER BY
        dayofweek(order_ts),
        sum(price) desc;
    `,

    // SQL used by the login endpoint /login
    // Get user_id and hashed_password matching user name
    verify_user: `
    SELECT USER_ID, USER_NAME, HASHED_PASSWORD, FRANCHISE_ID FROM app.USERS WHERE UPPER(USER_NAME) = UPPER(:1);
    `,

    // SQL used to get the range of dates for the orders
    orders_range: `
    SELECT 
        min(order_ts) as start_date, 
        max(order_ts) as end_date 
    FROM 
        app.orders
    WHERE
        franchise_id = :1
    `,

  };
  