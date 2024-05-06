-- Transaction
-- Requirement: Functional, with correct isolation level, at least two advanced queries, control structures (e.g., IF statements), and application utility.
-- We use Store Procedure + Transaction for this requirement:
-- This transaction is intended for update the user balance and trade table while a trade happens. If any procedure fail, the whole transaction will rollback.
-- This transaction also checks if the user's trade activity exceeds the designated limit of times or if the quantity of this trade is so large that it surpasses 20% of the user's total trade value. If either condition is met, it triggers a warning alert.
-- It is REPEATABLE-READ

CREATE DEFINER=`root`@`%` PROCEDURE `ExecuteTrade`(
    IN p_user_id VARCHAR(64),
    IN p_portfolio_id VARCHAR(64),
    IN p_asset_id VARCHAR(64),
    IN p_quantity DECIMAL(20,8),  -- positive: buy, negative: sell
    IN p_price DECIMAL(20,8)
)
BEGIN
    DECLARE v_balance DECIMAL(20,8);
    DECLARE v_hold_quantity DECIMAL(20,8) DEFAULT 0;
    DECLARE v_total_trade_value DECIMAL(20,8);
    DECLARE v_total_portfolio_value DECIMAL(20,8);
    DECLARE v_max_trade_count INT;
    DECLARE sufficient_funds BOOLEAN DEFAULT TRUE;
    DECLARE sufficient_assets BOOLEAN DEFAULT TRUE;
    DECLARE trade_risk_warning VARCHAR(255) DEFAULT '';
    
    START TRANSACTION;

    SELECT balance INTO v_balance FROM User WHERE id = p_user_id;
    
    IF p_quantity > 0 THEN
        -- Buying operation
        IF v_balance < (p_price * p_quantity) THEN
            SET sufficient_funds = FALSE;
        END IF;
    ELSE
        -- Selling operation
        SELECT hold_quantity INTO v_hold_quantity FROM Hold WHERE portfolio_id = p_portfolio_id AND asset_id = p_asset_id;
        IF v_hold_quantity < -p_quantity THEN
            SET sufficient_assets = FALSE;
        END IF;
    END IF;
    
    -- Calculate the total trade value
    SET v_total_trade_value = p_price * p_quantity;
    
    -- Calculate the total value of all assets in the portfolio
    SELECT SUM(price * quantity) INTO v_total_portfolio_value
    FROM Trade
    WHERE portfolio_id = p_portfolio_id;
    
    -- Find the maximum trade count for any asset in the portfolio over the last month
    SELECT MAX(trade_count) INTO v_max_trade_count
    FROM (
        SELECT asset_id, COUNT(*) AS trade_count
        FROM Trade
        WHERE portfolio_id = p_portfolio_id AND time > NOW() - INTERVAL 1 MONTH
        GROUP BY asset_id
    ) AS MonthlyTradeCounts;
    
    IF v_max_trade_count > 100 OR ABS(v_total_trade_value) > 0.2 * v_total_portfolio_value THEN
        SET trade_risk_warning = 'Risk Warning: High trading frequency or trade volume exceeding 20% of total portfolio value.';
    END IF;
    
    IF sufficient_funds AND sufficient_assets THEN
        IF p_quantity > 0 THEN
            -- Buy in, decrease user balance
            UPDATE User SET balance = balance - (p_price * abs(p_quantity)) WHERE id = p_user_id;
        ELSE
            -- Sell out, increase user balance
            UPDATE User SET balance = balance + (p_price * abs(p_quantity)) WHERE id = p_user_id;
        END IF;
        
        -- Store a trade record
        INSERT INTO Trade (id, portfolio_id, asset_id, quantity, price, time) 
        VALUES (UUID(), p_portfolio_id, p_asset_id, p_quantity, p_price, NOW());
        
        -- Commit the transaction
        COMMIT;
    ELSE
        -- Rollback the transaction
        ROLLBACK;
        IF NOT sufficient_funds THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient funds';
        ELSEIF NOT sufficient_assets THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient assets to sell';
        END IF;
    END IF;
END
;


