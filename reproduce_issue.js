
const baseUrl = 'http://localhost:3000/api/ads';

async function reproduce() {
    try {
        console.log('--- 1. Creating Advertisement ---');
        const createRes = await fetch(`${baseUrl}/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "Original Title",
                image: "original.png",
                price: "100",
                isActive: true
            })
        });
        const createData = await createRes.json();
        console.log('Create Response Success:', createData.success);
        const adId = createData.data._id;

        console.log('\n--- 2. Updating Advertisement ---');
        const updateRes = await fetch(`${baseUrl}/update/${adId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "Updated Title",
                price: "200"
            })
        });
        const updateData = await updateRes.json();
        console.log('Update Response Data:', JSON.stringify(updateData.data, null, 2));

        console.log('\n--- 3. Fetching All Logout Ads ---');
        const fetchRes = await fetch(`${baseUrl}/logout-ad`);
        const fetchData = await fetchRes.json();

        const updatedAdInList = fetchData.data.find(ad => ad._id === adId);

        if (updatedAdInList) {
            console.log('Found Ad in List:', JSON.stringify(updatedAdInList, null, 2));
            if (updatedAdInList.title === "Updated Title" && updatedAdInList.price === "200") {
                console.log('\nSUCCESS: Data matches updated values!');
            } else {
                console.log('\nFAILURE: Data DOES NOT match updated values!');
                console.log('Expected Title: Updated Title, Got:', updatedAdInList.title);
                console.log('Expected Price: 200, Got:', updatedAdInList.price);
            }
        } else {
            console.log('\nFAILURE: Updated Ad NOT FOUND in the logout-ad list!');
        }

    } catch (error) {
        console.error('Error during reproduction:', error);
    }
}

reproduce();
