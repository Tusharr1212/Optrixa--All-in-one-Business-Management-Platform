namespace Optrixa.Domain.Enums;

public enum MovementType
{
    Sale = 1,          // Stock decreased due to a sale
    Purchase = 2,      // Stock increased via supplier purchase
    Adjustment = 3,    // Manual correction by admin
    Return = 4         // Customer returned item
}