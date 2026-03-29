const baseUrl = 'http://localhost:3000/api/delivery';

async function testDeliveryAPI() {
    try {
        console.log('--- 1. Creating Delivery Person ---');
        const createRes = await fetch(`${baseUrl}/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "John Doe",
                phone: "9876543210",
                email: "john@example.com"
            })
        });
        const createData = await createRes.json();
        console.log('Create Response:', JSON.stringify(createData, null, 2));
        
        if (!createData.success) return;
        const personId = createData.data._id;

        console.log('\n--- 2. Fetching All Delivery Persons ---');
        const allRes = await fetch(`${baseUrl}/all`);
        const allData = await allRes.json();
        console.log('All Persons Count:', allData.data.length);

        console.log('\n--- 3. Updating Delivery Person ---');
        const updateRes = await fetch(`${baseUrl}/update/${personId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: "Inactive",
                rating: 4.5
            })
        });
        const updateData = await updateRes.json();
        console.log('Update Response:', JSON.stringify(updateData, null, 2));

        console.log('\n--- 4. Deleting Delivery Person ---');
        const deleteRes = await fetch(`${baseUrl}/delete/${personId}`, {
            method: 'DELETE'
        });
        const deleteData = await deleteRes.json();
        console.log('Delete Response:', JSON.stringify(deleteData, null, 2));

    } catch (error) {
        console.error('Error during API test:', error);
    }
}

testDeliveryAPI();
