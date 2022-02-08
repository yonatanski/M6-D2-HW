
--  DROP TABLE IF EXISTS  reviews;
--  DROP TABLE IF EXISTS  proudcts;



-- how to update table ? 

-- https://www.postgresqltutorial.com/postgresql-alter-table/



CREATE TABLE IF NOT EXISTS
    reviews(
       review_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        comment TEXT NOT NULL,
        rate INTEGER NOT NULL,

        created_at TIMESTAMPTZ DEFAULT NOW()
  
   );
CREATE TABLE IF NOT EXISTS 
    proudcts(
       product_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
       product_name VARCHAR(100) NOT NULL,
       descriptionn  VARCHAR(100) NOT NULL,
       brand VARCHAR(100) NOT NULL,
       image_url  VARCHAR(500) DEFAULT 'https://drop.ndtv.com/TECH/product_database/images/2152017124957PM_635_nokia_3310.jpeg?downsize=*:420&output-quality=80,',
       review_id INTEGER NOT NULL REFERENCES reviews(review_id) ON DELETE CASCADE,
       created_at TIMESTAMPTZ DEFAULT NOW(),
       updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    