export const Inventory = [
    {
        id: 201,
        Product_id: 101,
        movemement_type: 'INBOUND',
        quantity_moved: 11,
        movement_date: '10-09-2025',
        created_by: 1112,
        source_warehouse_id: 1,
        destination_warehouse_id: 2,
        notes: 'product',
        created_at: '10-09-2025',
        updated_at: '10-09-2025'
    },
    {
        id: 202,
        Product_id: 102,
        movemement_type: 'OUTBOUND',
        quantity_moved: 12,
        movement_date: '12-09-2025',
        created_by: 1113,
        source_warehouse_id: 2,
        destination_warehouse_id: 3,
        notes: 'product',
        created_at: '12-09-2025',
        updated_at: '12-09-2025'
    },
    {
        id: 203,
        Product_id: 103,
        movemement_type: 'TRANSFER',
        quantity_moved: 13,
        movement_date: '20-09-2025',
        created_by: 1113,
        source_warehouse_id: 3,
        destination_warehouse_id: 2,
        notes: 'product',
        created_at: '20-09-2025',
        updated_at: '20-09-2025'
    },
    {
        id: 204,
        Product_id: 104,
        movemement_type: 'ADJUSTMENT',
        quantity_moved: 14,
        movement_date: '30-09-2025',
        created_by: 1112,
        source_warehouse_id: 3,
        destination_warehouse_id: 1,
        notes: 'product',
        created_at: '30-09-2025',
        updated_at: '30-09-2025'
    }
]