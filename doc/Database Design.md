# Database Design

## Part 1: 
**1. Implement five main tables**
Based on Stage2's design, we implemented tables named User, Post, Portfolio, InvestmentAdvice, Asset and Trade on a GCP MySQL instance.
Database connection
![image](https://hackmd.io/_uploads/SJeUwFxzlR.png)

**2. Data Definition Language (DDL) commands :**

~~~ sql
CREATE TABLE IF NOT EXISTS User(
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(256),
    password VARCHAR(256),
    email VARCHAR(256),
    join_time DATETIME,
    balance DECIMAL(20,8),
    burger_coin INT    
);

CREATE TABLE IF NOT EXISTS Post(
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(256),
    thumbs_up_num INT,
    description TEXT,
    content TEXT,
    user_id VARCHAR(64) REFERENCES User(id) on delete set NULL on update cascade,
    create_time DATETIME,
    update_time DATETIME
);

CREATE TABLE IF NOT EXISTS Portfolio(
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(256),
    color INT,
    is_pinned BOOLEAN,
    user_id VARCHAR(64) REFERENCES User(id) on delete cascade on update cascade
);

CREATE TABLE IF NOT EXISTS InvestmentAdvice(
    id VARCHAR(64) PRIMARY KEY,
    content TEXT,
    title VARCHAR(256),
    portfolio_id VARCHAR(64) REFERENCES Portfolio(id) on delete cascade on update cascade,
    create_time DATETIME
);

CREATE TABLE IF NOT EXISTS Asset(
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(256),
    symbol_url VARCHAR(256)
);

CREATE TABLE IF NOT EXISTS Trade(
    id VARCHAR(64) PRIMARY KEY,
    portfolio_id VARCHAR(64) REFERENCES Portfolio(id) on delete set null on update cascade,
    asset_id VARCHAR(64) REFERENCES Asset(id) on delete set null on update cascade,
    quantity DECIMAL(20,8),
    price DECIMAL(20,8),
    time DATETIME
);


~~~

**3. Insert data into these tables.**

We first generate user data with:https://generatedata.com/generator
Then we try to use WebCrawler to get some posts from X with #Crypto tag but due to the constrains of X we cannot do so. We then turn to LLM(ChatGPT) for generating 1000 blog post related to Crypto investment and news.

![image](https://hackmd.io/_uploads/ryBCwgGgR.png)
![image](https://hackmd.io/_uploads/HyNQOlGeR.png)
![image](https://hackmd.io/_uploads/BJpN_lGx0.png)


**4. Advanced SQL queries.**

~~~ sql
-- find all kinds of assets and corresponding quantities for users
select p.user_id, t.asset_id, sum(t.quantity)
from Portfolio p join Trade t on p.id = t.portfolio_id
group by p.user_id, t.asset_id

-- find the “Golden customer", which means to have more than 200 thumb ups for all posts or have more than 5 portfolios
SELECT u.id as user_id
FROM User u
JOIN Post p ON u.id = p.user_id
GROUP BY u.id
HAVING SUM(p.thumbs_up_num) > 200

UNION

SELECT u.id as user_id
FROM User u
JOIN Portfolio pf ON u.id = pf.user_id
GROUP BY u.id
HAVING COUNT(pf.id) > 5


-- find the highest price for all assets from 2022-3-1 to 2023-3-1
select name,max(price) price
from Trade T join Asset A on T.asset_id=A.id
where name='bitcoin' and time between '2022-3-1' and '2023-3-1'
group by name

-- find the post for each user created bwtween 2024-3-1 and 2024-5-1 that has the most thumbs_up_num

SELECT U.id AS user_id, P.id AS post_id, P.thumbs_up_num
FROM User U
JOIN Post P ON U.id = P.user_id
JOIN (
    SELECT user_id, MAX(thumbs_up_num) AS max_thumbs_up
    FROM Post
    WHERE create_time BETWEEN '2022-3-1' AND '2024-5-1'
    GROUP BY user_id
) AS MaxThumbsUp ON P.user_id = MaxThumbsUp.user_id AND P.thumbs_up_num = MaxThumbsUp.max_thumbs_up
WHERE P.create_time BETWEEN '2022-3-1' AND '2024-5-1';
~~~

**5. Screenshot of the top 15 rows** 

~~~ sql
-- find all kinds of assets and corresponding quantities for users
select p.user_id, t.asset_id, sum(t.quantity)
from Portfolio p join Trade t on p.id = t.portfolio_id
group by p.user_id, t.asset_id
limit 15;
~~~
query1![image](https://hackmd.io/_uploads/Syu20cxgC.png)

~~~ sql
-- find the “Golden customer", which means to have more than 200 thumb ups for all posts or have more than 5 portfolios
SELECT u.id as user_id
FROM User u
JOIN Post p ON u.id = p.user_id
GROUP BY u.id
HAVING SUM(p.thumbs_up_num) > 200

UNION

SELECT u.id as user_id
FROM User u
JOIN Portfolio pf ON u.id = pf.user_id
GROUP BY u.id
HAVING COUNT(pf.id) > 5
limit 15;
~~~
query2![image](https://hackmd.io/_uploads/BkBxyjllR.png)

~~~ sql
-- find the highest price for all assets from 2024-3-1 to 2024-5-1

select name,max(price) price
from Trade T join Asset A on T.asset_id=A.id
where name='HIT' and time between '2024-4-1' and '2024-4-10'
group by name
limit 15;
~~~
query3![image](https://hackmd.io/_uploads/SyxKCclxA.png)

~~~ sql
-- find the post for each user created bwtween 2024-3-1 and 2024-5-1 that has the most thumbs_up_num

SELECT U.id AS user_id, P.id AS post_id, P.thumbs_up_num
FROM User U
JOIN Post P ON U.id = P.user_id
JOIN (
    SELECT user_id, MAX(thumbs_up_num) AS max_thumbs_up
    FROM Post
    WHERE create_time BETWEEN '2022-3-1' AND '2024-5-1'
    GROUP BY user_id
) AS MaxThumbsUp ON P.user_id = MaxThumbsUp.user_id AND P.thumbs_up_num = MaxThumbsUp.max_thumbs_up
WHERE P.create_time BETWEEN '2022-3-1' AND '2024-5-1';
~~~
query4![image](https://hackmd.io/_uploads/S1gBljle0.png)


## Part 2
**1. Use the EXPLAIN ANALYZE command to measure your advanced query performance before adding indexes.**
Tips: You should be using the cost, not the time, since time can vary each time you run a query. 
query1![image](https://hackmd.io/_uploads/SJP_TclxA.png)
query2![image](https://hackmd.io/_uploads/rJnZ-jxxA.png)
query3![image](https://hackmd.io/_uploads/Sy1TljgeA.png)
query4![image](https://hackmd.io/_uploads/SJR5xsleC.png)


**2. Explore tradeoffs of adding different indices to different attributes on some of your advanced queries. For each indexing design you try, use the EXPLAIN ANALYZE command to measure the query performance after adding the indices. Report the performance gains or degradations for each indexing configuration you tried. You may use a line chart to visualize your results if you wish.**

*Tips: Don't index primary keys, don't index attributes that don't appear in your query. We recommend trying to index JOIN attributes or attributes that appear in the WHERE, GROUP BY, or HAVING clauses.*




- For query 1

```sql
EXPLAIN
select p.user_id, t.asset_id, sum(t.quantity)
from Portfolio p join Trade t on p.id = t.portfolio_id
group by p.user_id, t.asset_id;

CREATE INDEX idx_trade_portfolio_id ON Trade(portfolio_id);

ALTER TABLE Trade DROP INDEX idx_trade_portfolio_id;
```
![image](https://hackmd.io/_uploads/B1r_zieeA.png)

```sql
CREATE INDEX idx_portfolio_user_id ON Portfolio(user_id);
ALTER TABLE Portfolio DROP INDEX idx_portfolio_user_id;
```
![image](https://hackmd.io/_uploads/rJXeXjlgC.png)


```sql
CREATE INDEX idx_portfolio_user_id ON Portfolio(user_id);
CREATE INDEX idx_trade_portfolio_id ON Trade(portfolio_id);
ALTER TABLE Trade DROP INDEX idx_trade_portfolio_id;
ALTER TABLE Portfolio DROP INDEX idx_portfolio_user_id;
```
![image](https://hackmd.io/_uploads/BJ2cVoelC.png)


- For query 2

```sql
EXPLAIN
SELECT u.id as user_id
FROM User u
JOIN Post p ON u.id = p.user_id
GROUP BY u.id
HAVING SUM(p.thumbs_up_num) > 200

UNION

SELECT u.id as user_id
FROM User u
JOIN Portfolio pf ON u.id = pf.user_id
GROUP BY u.id
HAVING COUNT(pf.id) > 5;

CREATE INDEX idx_portfolio_user_id ON Portfolio(user_id);
ALTER TABLE Portfolio DROP INDEX idx_portfolio_user_id;
```
![image](https://hackmd.io/_uploads/H1izBjxxA.png)

```sql
CREATE INDEX idx_post_user_id ON Post(user_id);
ALTER TABLE Post DROP INDEX idx_post_user_id;
```
![image](https://hackmd.io/_uploads/ry6vPjxlC.png)


```sql 
CREATE INDEX idx_portfolio_user_id ON Portfolio(user_id);
CREATE INDEX idx_post_user_id ON Post(user_id);
```
![image](https://hackmd.io/_uploads/HJ92PogxR.png)

```sql 
ALTER TABLE Portfolio DROP INDEX idx_portfolio_user_id;
ALTER TABLE Post DROP INDEX idx_post_user_id;
```

- For query 3

```sql 
EXPLAIN
select name,max(price) price
from Trade T join Asset A on T.asset_id=A.id
where name='HIT' and time between '2024-4-1' and '2024-4-10'
group by name;
```

```sql 
CREATE INDEX idx_trade_time ON Trade(time);
ALTER TABLE Trade DROP INDEX idx_trade_time;
```
![image](https://hackmd.io/_uploads/S1yQujelC.png)


```sql 
CREATE INDEX idx_asset_name ON Asset(name);
ALTER TABLE Asset DROP INDEX idx_asset_name;
```
![image](https://hackmd.io/_uploads/HyA8Ojel0.png)


```sql 
CREATE INDEX idx_trade_time ON Trade(time);
CREATE INDEX idx_asset_name ON Asset(name);
ALTER TABLE Asset DROP INDEX idx_asset_name;
ALTER TABLE Trade DROP INDEX idx_trade_time;
```
![image](https://hackmd.io/_uploads/rJI5djxe0.png)



- For query 4

```sql 
EXPLAIN
SELECT U.id AS user_id, P.id AS post_id, P.thumbs_up_num
FROM User U
JOIN Post P ON U.id = P.user_id
JOIN (
    SELECT user_id, MAX(thumbs_up_num) AS max_thumbs_up
    FROM Post
    WHERE create_time BETWEEN '2022-3-1' AND '2024-5-1'
    GROUP BY user_id
) AS MaxThumbsUp ON P.user_id = MaxThumbsUp.user_id AND P.thumbs_up_num = MaxThumbsUp.max_thumbs_up
WHERE P.create_time BETWEEN '2022-3-1' AND '2024-5-1';


CREATE INDEX idx_post_create_time ON Post(create_time);
ALTER TABLE Post DROP INDEX idx_post_create_time;
```
![image](https://hackmd.io/_uploads/rkvyYole0.png)

```sql 
CREATE INDEX idx_post_thumbs_up_num ON Post(thumbs_up_num);
ALTER TABLE Post DROP INDEX idx_post_thumbs_up_num;
```
![image](https://hackmd.io/_uploads/rkGStjgeA.png)


```sql 
CREATE INDEX idx_post_create_time ON Post(create_time);
CREATE INDEX idx_post_thumbs_up_num ON Post(thumbs_up_num);
ALTER TABLE Post DROP INDEX idx_post_thumbs_up_num;
ALTER TABLE Post DROP INDEX idx_post_create_time;
```
![image](https://hackmd.io/_uploads/S1ITKigeA.png)




**3. Report on the final index design you selected and explain why you chose it, referencing the analysis you performed.**

```sql
CREATE INDEX idx_trade_asset_id ON Trade(portfolio_id);
```
This index is for the portfolio_id on Trade table. We found that in query 1, it is used as "joined key". Building this key will reduce the rows to be scanned. The evaluation in section 2.
In details, before building the index, the query engine uses the eq_ref join to look up the corresponding row in p for each row in t. And with the index, it may find that using the index to first filter t and then finding the associated p records is more efficient.

```sql
CREATE INDEX idx_portfolio_user_id ON Portfolio(user_id);
```
This index is for the user_id on Portfolio table. We found that in query 2, it is used as "joined key". Building this key will reduce the rows to be scanned. The evaluation in section 2.
In details, the type for this query and Portfolio table changed from ALL (full table scan) to ref (index lookup).

```sql
CREATE INDEX idx_asset_name ON Asset(name);
```
This index is for the name on Asset table. We found that in query 3, it is used as selection condition in where clause. Building this key will reduce the rows to be scanned. The evaluation in section 2.
In details, the type changes from ALL (indicating a full scan) to ref (indicating an index lookup)

```sql
CREATE INDEX idx_post_thumbs_up_num ON Post(thumbs_up_num);
```
This index is for the thumbs_up_num on Post table. We found that in query 4, it is used as selection condition in where clause. Building this key will reduce
The type for the Post table changed from ALL (indicating a full table scan) to index (indicating that the query can now utilize the index to directly access the relevant rows). Consequently, the rows value in the EXPLAIN output significantly decreased from 913 to 101


**4. Note that if you did not find any difference in your results, report that as well. Explain why you think this change in indexing did not bring a better effect on your queries' performance.**

*** Query1

```sql
CREATE INDEX idx_portfolio_user_id ON Portfolio(user_id);
```
The execution plan does not change after building the index. This may be caused by some cardinality analysis.

*** Query2
```sql
CREATE INDEX idx_post_user_id ON Post(user_id);
```
As the EXPLAIN shows, this index occurs in "possible key" field, but not "key" field. This means it is not used. This may be cause by limited number of users.

*** Query3
```sql
CREATE INDEX idx_trade_time ON Trade(time);
```
Because we filtered asset name first which nullified index on trade time.

