/**
 * Test API Routes
 * Tests the API routes to see what they're actually returning
 */

async function testApiRoutes() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  
  console.log("🧪 Testing API Routes\n");
  console.log(`Base URL: ${baseUrl}\n`);

  // Test Products API
  console.log("1️⃣  Testing /api/products");
  try {
    const productsResponse = await fetch(`${baseUrl}/api/products`);
    const productsData = await productsResponse.json();
    console.log(`   Status: ${productsResponse.status}`);
    console.log(`   Products count: ${productsData.products?.length || 0}`);
    console.log(`   Total: ${productsData.total || 0}`);
    if (productsData.products?.length === 0) {
      console.log("   ⚠️  No products returned!");
      console.log(`   Response: ${JSON.stringify(productsData).substring(0, 200)}...`);
    } else {
      console.log(`   ✅ Products returned: ${productsData.products.length}`);
    }
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
  }

  console.log("\n2️⃣  Testing /api/categories");
  try {
    const categoriesResponse = await fetch(`${baseUrl}/api/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log(`   Status: ${categoriesResponse.status}`);
    if (Array.isArray(categoriesData)) {
      console.log(`   Categories count: ${categoriesData.length}`);
      if (categoriesData.length === 0) {
        console.log("   ⚠️  No categories returned!");
      } else {
        console.log(`   ✅ Categories returned: ${categoriesData.length}`);
      }
    } else {
      console.log(`   Categories count: ${categoriesData.categories?.length || 0}`);
      console.log(`   Total: ${categoriesData.total || 0}`);
      if (categoriesData.categories?.length === 0) {
        console.log("   ⚠️  No categories returned!");
      } else {
        console.log(`   ✅ Categories returned: ${categoriesData.categories.length}`);
      }
    }
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
  }

  console.log("\n3️⃣  Testing /api/blog?published=true");
  try {
    const blogResponse = await fetch(`${baseUrl}/api/blog?published=true`);
    const blogData = await blogResponse.json();
    console.log(`   Status: ${blogResponse.status}`);
    if (Array.isArray(blogData)) {
      console.log(`   Blog posts count: ${blogData.length}`);
      if (blogData.length === 0) {
        console.log("   ⚠️  No blog posts returned!");
      } else {
        console.log(`   ✅ Blog posts returned: ${blogData.length}`);
      }
    } else {
      console.log(`   ⚠️  Unexpected response format: ${JSON.stringify(blogData).substring(0, 200)}`);
    }
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
  }

  console.log("\n✅ API route testing complete\n");
}

testApiRoutes().catch(console.error);

