
const baseUrl = 'http://localhost:3000/api/ads';

async function testManageAds() {
  try {
    // 1. Create an Ad
    console.log('--- Step 1: Create Ad ---');
    const createRes = await fetch(`${baseUrl}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Test Ad for Management",
        image: "test.png",
        price: "100"
      })
    });
    const createData = await createRes.json();
    console.log('Created Ad:', JSON.stringify(createData, null, 2));

    if (!createData.success) throw new Error('Create failed');
    const adId = createData.data._id;

    // 2. Update the Ad
    console.log('\n--- Step 2: Update Ad ---');
    const updateRes = await fetch(`${baseUrl}/update/${adId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price: "₹ 150",
        discount: "10% OFF"
      })
    });
    const updateData = await updateRes.json();
    console.log('Updated Ad:', JSON.stringify(updateData, null, 2));

    if (!updateData.success || updateData.data.price !== "₹ 150") {
      throw new Error('Update failed or data mismatch');
    }

    // 3. Delete the Ad
    console.log('\n--- Step 3: Delete Ad ---');
    const deleteRes = await fetch(`${baseUrl}/delete/${adId}`, {
      method: 'DELETE'
    });
    const deleteData = await deleteRes.json();
    console.log('Deleted Ad:', JSON.stringify(deleteData, null, 2));

    if (!deleteData.success) throw new Error('Delete failed');

    // 4. Verify Delete
    console.log('\n--- Step 4: Verify Delete ---');
    const verifyRes = await fetch(`${baseUrl}/logout-ad`);
    const verifyData = await verifyRes.json();
    const deletedFound = verifyData.data.some(ad => ad._id === adId);
    console.log('Ad found in list after delete?', deletedFound);

    if (deletedFound) throw new Error('Delete verification failed - ad still exists');

    console.log('\nSUCCESS: All management tests passed!');

  } catch (err) {
    console.error('Error during management test:', err.message);
  }
}

testManageAds();
