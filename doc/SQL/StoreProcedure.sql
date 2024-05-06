-- Requirement: Functional, with at least two advanced queries, cursors (optional), control structures, and application utility.
-- Procedure Name: CalculatePortfolioCostAndStatus
-- Purpose: This stored procedure calculates the total financial expenditure associated with each portfolio belonging to a specified user and assesses the risk status based on the expenditure amount.
-- Parameters: user_id (VARCHAR(64))

DELIMITER //

CREATE PROCEDURE CalculatePortfolioCostAndStatus(IN user_id VARCHAR(64))
BEGIN
    CREATE TEMPORARY TABLE IF NOT EXISTS PortfolioCosts (
        portfolio_id VARCHAR(64),
        total_cost DECIMAL(20,8) DEFAULT 0
    );
    TRUNCATE TABLE PortfolioCosts;

    -- calculate each portfolio's cost
    -- positive value for spent, negative value for earn
    INSERT INTO PortfolioCosts (portfolio_id, total_cost)
    SELECT P.id, IFNULL(SUM(T.quantity * T.price), 0) AS total_cost
    FROM Portfolio P
    LEFT JOIN Trade T ON P.id = T.portfolio_id
    WHERE P.user_id = user_id
    GROUP BY P.id;

    -- evaluate the risk
    SELECT P.id AS Portfolio_ID, P.name AS Portfolio_Name, IFNULL(PC.total_cost, 0) AS Total_Cost,
           CASE 
               WHEN IFNULL(PC.total_cost, 0) > 10000 THEN 'risk_high'
               WHEN IFNULL(PC.total_cost, 0) > 5000 THEN 'risk_mid'
               ELSE 'risk_low'
           END AS Portfolio_Status
    FROM Portfolio P
    LEFT JOIN PortfolioCosts PC ON P.id = PC.portfolio_id
    WHERE P.user_id = user_id;

    DROP TEMPORARY TABLE PortfolioCosts;
END;
