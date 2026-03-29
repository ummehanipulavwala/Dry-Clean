const baseUrl = 'http://localhost:3000/api/delivery';

async function testUpdate() {
    try {
        // 1. Create a person first
        const createRes = await fetch(`${baseUrl}/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: "Test Person", phone: "1112223334" })
        });
        const createData = await createRes.json();
        if (!createData.success) {
            console.error("Create failed:", createData);
            return;
        }
        const id = createData.data._id;
        console.log("Created ID:", id);

        // 2. Try to update
        const updateRes = await fetch(`${baseUrl}/update/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: "Updated Name", rating: 4.8 })
        });
        const updateData = await updateRes.json();
        console.log("Update Response:", JSON.stringify(updateData, null, 2));

    } catch (err) {
        console.error("Error:", err);
    }
}

testUpdate();
