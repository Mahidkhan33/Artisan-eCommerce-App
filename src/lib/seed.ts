import mongoose from "mongoose";
import User from "@/models/Customer";
import Artisan from "@/models/Artisan";
import Product from "@/models/Product";
import Cart from "@/models/Cart";

export async function seedDatabase() {
  try {
    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      
      return;
    }

    console.log("🎨 Database is empty. Seeding initial artisan partner and bespoke products...");

    let artisan = await Artisan.findOne({ email: "artisan@artisanalley.com" });
    if (!artisan) {
      artisan = new Artisan({
        fullName: {
          firstName: "Zain",
          lastName: "Ali",
        },
        email: "artisan@artisanalley.com",
        cnic: "3420199887766",
        phoneNumber: "03001234567",
        studioName: "Clay & Grain Workshop",
        studioLocation: "Faisalabad, Punjab",
        studioDescription: "A premium independent studio specializing in small-batch glazed stoneware, vegetable-tanned leather goods, and organic wood carvings. Every piece is hand-pressed, hand-stitched, and signed by our makers.",
        accountHolderName: "Zain Ali",
        bankAccountNumber: "PK49ALLCO001009988776655",
        password: "password123", 
        isVerified: true,
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
      });
      await artisan.save();
      console.log("✅ Seed Artisan created successfully (artisan@artisanalley.com / password123)");
    }

    let collector = await User.findOne({ email: "collector@artisanalley.com" });
    if (!collector) {
      collector = new User({
        fullName: {
          firstName: "Sarah",
          lastName: "Khan",
        },
        email: "collector@artisanalley.com",
        phoneNumber: "03112233445",
        password: "password123", 
        isVerified: true,
      });
      await collector.save();

      const cart = new Cart({
        userId: collector._id,
        items: [],
      });
      await cart.save();
      console.log("✅ Seed Collector created successfully (collector@artisanalley.com / password123)");
    }

    const artisanId = artisan._id;

    const seedProducts = [
      {
        name: "Speckled Stoneware Glazed Mug",
        description: "Hand-thrown clay mug finished in a rustic speckled satin glaze. Features a comfortable wide handle and thick walls to retain warmth. Dishwasher and microwave safe.",
        price: 950,
        category: "Ceramics",
        quantity: 25,
        unit: "piece",
        images: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600"],
        artisanId,
        isAvailable: true,
        rating: 4.8,
        location: "Faisalabad, Punjab",
        sellerName: "Clay & Grain Workshop"
      },
      {
        name: "Vegetable-Tanned Stitched Satchel",
        description: "Bespoke daily satchel hand-stitched from full-grain vegetable-tanned leather. Develops a gorgeous dark honey patina with wear. Solid brass buckles and adjustable shoulder strap.",
        price: 4800,
        category: "Leathercraft",
        quantity: 5,
        unit: "piece",
        images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600"],
        artisanId,
        isAvailable: true,
        rating: 5.0,
        location: "Faisalabad, Punjab",
        sellerName: "Clay & Grain Workshop"
      },
      {
        name: "Handwoven Linen Indigo Tapestry",
        description: "Elegant wall hanging woven on a traditional loom with organic Turkish linen. Dyed with natural plant-extracted indigo in cascading geometric waves.",
        price: 2900,
        category: "Textiles",
        quantity: 8,
        unit: "piece",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600"],
        artisanId,
        isAvailable: true,
        rating: 4.9,
        location: "Faisalabad, Punjab",
        sellerName: "Clay & Grain Workshop"
      },
      {
        name: "Hand-Carved Walnut Serving Board",
        description: "Bespoke serving and charcuterie board carved from a single slab of seasoned American Walnut wood. Treated with organic mineral oils and beeswax. Smooth curved handle.",
        price: 2400,
        category: "Woodwork",
        quantity: 12,
        unit: "piece",
        images: ["https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&q=80&w=600"],
        artisanId,
        isAvailable: true,
        rating: 4.7,
        location: "Faisalabad, Punjab",
        sellerName: "Clay & Grain Workshop"
      },
      {
        name: "Spotted Terrazzo Clay Bowl",
        description: "Medium centerpiece fruit bowl with colorful raw terrazzo clay shards hand-pressed into the white earthenware. Sanded matte exterior and clear glazed interior.",
        price: 1800,
        category: "Ceramics",
        quantity: 15,
        unit: "piece",
        images: ["https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=600"],
        artisanId,
        isAvailable: true,
        rating: 4.6,
        location: "Faisalabad, Punjab",
        sellerName: "Clay & Grain Workshop"
      },
      {
        name: "Minimalist Stitch Card Wallet",
        description: "Ultra-slim credit cardholder stitched with thick waxed linen thread. Features 4 snug card slots and a central compartment for folded bills. Sleek raw burnished edges.",
        price: 1200,
        category: "Leathercraft",
        quantity: 20,
        unit: "piece",
        images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600"],
        artisanId,
        isAvailable: true,
        rating: 4.9,
        location: "Faisalabad, Punjab",
        sellerName: "Clay & Grain Workshop"
      },
      {
        name: "Woven Waffle Cotton Blanket",
        description: "Exquisitely soft, organic cotton throw blanket woven in a deep honeycomb waffle pattern. Extremely breathable, warm, and finished with delicate hand-knotted fringes.",
        price: 3200,
        category: "Textiles",
        quantity: 10,
        unit: "piece",
        images: ["https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&q=80&w=600"],
        artisanId,
        isAvailable: true,
        rating: 4.8,
        location: "Faisalabad, Punjab",
        sellerName: "Clay & Grain Workshop"
      },
      {
        name: "Solid White Oak Incense Dock",
        description: "Minimalist incense holder carved from solid premium white oak wood. Features a central brass core to securely hold sticks and a gently curved ash-catcher canal.",
        price: 850,
        category: "Woodwork",
        quantity: 30,
        unit: "piece",
        images: ["https://images.unsplash.com/photo-1602872030219-c0c538cb312d?auto=format&fit=crop&q=80&w=600"],
        artisanId,
        isAvailable: true,
        rating: 4.5,
        location: "Faisalabad, Punjab",
        sellerName: "Clay & Grain Workshop"
      },
      {
        name: "Beeswax Botanical Scented Candle",
        description: "100% natural organic beeswax hand-poured into a handmade ceramic container. Infused with cedarwood, crushed sage, and wild lavender essential oils. Wood wick crackles softly.",
        price: 1100,
        category: "Other",
        quantity: 18,
        unit: "piece",
        images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600"],
        artisanId,
        isAvailable: true,
        rating: 4.7,
        location: "Faisalabad, Punjab",
        sellerName: "Clay & Grain Workshop"
      }
    ];

    await Product.insertMany(seedProducts);
    console.log(`✅ Successfully seeded ${seedProducts.length} premium handcrafted products in the database!`);
  } catch (error) {
    console.error("❌ Failed to seed database:", error);
  }
}
