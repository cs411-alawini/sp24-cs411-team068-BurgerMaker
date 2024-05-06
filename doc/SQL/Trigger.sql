-- Trigger
-- Requirement: Functioning triggers, involving an event, condition (IF statement), and action (Update, Insert, Delete), enhancing the application.
-- Trigger1: Update the `hold` table when insert on trade table happens.
-- Trigger2: Auto set join time trigger


DELIMITER $$

CREATE TRIGGER UpdateHoldAfterTrade
AFTER INSERT ON Trade
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM Hold WHERE portfolio_id = NEW.portfolio_id AND asset_id = NEW.asset_id) THEN
        UPDATE Hold
        SET hold_quantity = hold_quantity + NEW.quantity
        WHERE portfolio_id = NEW.portfolio_id AND asset_id = NEW.asset_id;
        DELETE FROM Hold
        WHERE portfolio_id = NEW.portfolio_id AND asset_id = NEW.asset_id AND hold_quantity <= 0;
    ELSE
        IF NEW.quantity > 0 THEN
            INSERT INTO Hold (portfolio_id, asset_id, hold_quantity)
            VALUES (NEW.portfolio_id, NEW.asset_id, NEW.quantity);
        END IF;
    END IF;
END$$

DELIMITER ;


CREATE TRIGGER SetJoinTime BEFORE INSERT ON User
FOR EACH ROW
BEGIN
    SET NEW.join_time = NOW();
END;