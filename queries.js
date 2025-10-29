// queries.js - Script to demonstrate MongoDB queries and operations

const { MongoClient } = require('mongodb');

// Connection URI (use your own if on Atlas)
const uri = 'mongodb://localhost:27017';

// Database and collection names
const dbName = 'plp_bookstore';
const collectionName = 'books';

async function runQueries() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    console.log('\n📘 BASIC CRUD OPERATIONS ----------------');

    // 1️⃣ Find all books in a specific genre
    console.log('\nAll Fantasy books:');
    console.log(await collection.find({ genre: 'Fantasy' }).toArray());

    // 2️⃣ Find books published after a certain year
    console.log('\nBooks published after 1950:');
    console.log(await collection.find({ published_year: { $gt: 1950 } }).toArray());

    // 3️⃣ Find books by a specific author
    console.log('\nBooks by George Orwell:');
    console.log(await collection.find({ author: 'George Orwell' }).toArray());

    // 4️⃣ Update the price of a specific book
    const updateResult = await collection.updateOne(
      { title: 'The Great Gatsby' },
      { $set: { price: 11.99 } }
    );
    console.log(`\nUpdated price of "The Great Gatsby": ${updateResult.modifiedCount} document(s) updated`);

    // 5️⃣ Delete a book by its title
    const deleteResult = await collection.deleteOne({ title: 'Moby Dick' });
    console.log(`\nDeleted "Moby Dick": ${deleteResult.deletedCount} document(s) deleted`);

    console.log('\n🧠 ADVANCED QUERIES ----------------');

    // 6️⃣ Find books that are both in stock and published after 2010
    console.log('\nBooks in stock and published after 2010:');
    console.log(await collection.find({ in_stock: true, published_year: { $gt: 2010 } }).toArray());

    // 7️⃣ Projection: return only title, author, and price
    console.log('\nProjection (title, author, price only):');
    console.log(await collection.find({}, { projection: { _id: 0, title: 1, author: 1, price: 1 } }).toArray());

    // 8️⃣ Sort by price ascending
    console.log('\nBooks sorted by price (ascending):');
    console.log(await collection.find().sort({ price: 1 }).toArray());

    // 9️⃣ Sort by price descending
    console.log('\nBooks sorted by price (descending):');
    console.log(await collection.find().sort({ price: -1 }).toArray());

    // 🔟 Pagination (5 books per page)
    console.log('\nPagination (Page 1 – first 5 books):');
    console.log(await collection.find().skip(0).limit(5).toArray());

    console.log('\nPagination (Page 2 – next 5 books):');
    console.log(await collection.find().skip(5).limit(5).toArray());

    console.log('\n🧮 AGGREGATION PIPELINES ----------------');

    // 11️⃣ Average price of books by genre
    console.log('\nAverage price of books by genre:');
    console.log(await collection.aggregate([
      { $group: { _id: "$genre", avgPrice: { $avg: "$price" } } }
    ]).toArray());

    // 12️⃣ Author with the most books
    console.log('\nAuthor with the most books:');
    console.log(await collection.aggregate([
      { $group: { _id: "$author", totalBooks: { $sum: 1 } } },
      { $sort: { totalBooks: -1 } },
      { $limit: 1 }
    ]).toArray());

    // 13️⃣ Group books by publication decade
    console.log('\nBooks grouped by publication decade:');
    console.log(await collection.aggregate([
      {
        $group: {
          _id: {
            $concat: [
              { $toString: { $multiply: [{ $floor: { $divide: ["$published_year", 10] } }, 10] } },
              "s"
            ]
          },
          totalBooks: { $sum: 1 }
        }
      }
    ]).toArray());

    console.log('\n⚡ INDEXING ----------------');

    // 14️⃣ Create index on title
    await collection.createIndex({ title: 1 });
    console.log('Created index on title');

    // 15️⃣ Create compound index on author and published_year
    await collection.createIndex({ author: 1, published_year: -1 });
    console.log('Created compound index on author and published_year');

    // 16️⃣ Demonstrate explain() performance
    console.log('\nExplain query performance for title search:');
    const explain = await collection.find({ title: 'The Hobbit' }).explain('executionStats');
    console.log(JSON.stringify(explain.executionStats, null, 2));

    console.log('\n All queries executed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

runQueries().catch(console.error);
