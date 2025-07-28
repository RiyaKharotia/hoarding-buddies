
import mongoose from "mongoose";
import { DATABASE_URL } from "../configs/envConfig.js";
import UserModel from "../models/user.js";
import HoardingModel from "../models/hoarding.js";
import AssignmentModel from "../models/assignment.js";
import ContractModel from "../models/contract.js";
import BillingModel from "../models/billing.js";
import PhotographerModel from "../models/photographer.js";
import ClientModel from "../models/client.js";
import PhotoModel from "../models/photo.js";
import bcryptjs from "bcryptjs";
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { UserRole, HoardingStatus, AssignmentStatus, ContractStatus, PaymentStatus, PhotographerStatus, ClientStatus, PhotoStatus } from "./types.js";

// Get the directory path for when script is run directly
const __filename = fileURLToPath(import.meta.url);

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(DATABASE_URL);
      console.log("Connected to MongoDB for seeding");
    }
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

// Seed users
const seedUsers = async () => {
  try {
    // Clear existing users
    await UserModel.deleteMany({});
    
    // Create hashed password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash("password123", salt);
    
    // Create users
    const ownerUser = new UserModel({
      name: "Om Prakash",
      email: "om@gmail.com",
      password: hashedPassword,
      role: UserRole.OWNER,
      phone: "+91 98765 43210",
      location: "Mumbai",
      avatar: "/uploads/users/om@gmail.com-1743531614757.png"
    });
    
    const photographerUser = new UserModel({
      name: "Photo Grapher",
      email: "photo@gmail.com",
      password: hashedPassword,
      role: UserRole.PHOTOGRAPHER,
      phone: "+91 87654 32109",
      location: "Delhi",
      avatar: "/uploads/users/photo@gmail.com-1743531685387.png"
    });
    
    const clientUser = new UserModel({
      name: "Client User",
      email: "client@gmail.com",
      password: hashedPassword,
      role: UserRole.CLIENT,
      phone: "+91 76543 21098",
      location: "Bangalore"
    });
    
    // Add more photographer and client users for sample data
    const additionalPhotographerUser = new UserModel({
      name: "John Photographer",
      email: "john@gmail.com",
      password: hashedPassword,
      role: UserRole.PHOTOGRAPHER,
      phone: "+91 89654 33109",
      location: "Chennai",
    });
    
    const additionalClientUser = new UserModel({
      name: "Acme Advertising",
      email: "acme@gmail.com",
      password: hashedPassword,
      role: UserRole.CLIENT,
      phone: "+91 76543 98765",
      location: "Hyderabad"
    });
    
    await ownerUser.save();
    await photographerUser.save();
    await clientUser.save();
    await additionalPhotographerUser.save();
    await additionalClientUser.save();
    
    console.log("Users seeded successfully");
    return { 
      ownerUser, 
      photographerUser, 
      clientUser,
      additionalPhotographerUser,
      additionalClientUser 
    };
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
};

// Seed photographer profiles
const seedPhotographerProfiles = async (photographers) => {
  try {
    // Clear existing photographer profiles
    await PhotographerModel.deleteMany({});
    
    // Create photographer profiles
    const photographerProfiles = [];
    
    // Main photographer
    const photographerProfile = new PhotographerModel({
      uid: photographers.photographerUser._id,
      status: PhotographerStatus.ACTIVE,
      assignedHoardings: 3,
      photosUploaded: 15,
      bio: "Professional photographer with 5+ years experience in outdoor advertising photography."
    });
    
    // Additional photographer
    const additionalPhotographerProfile = new PhotographerModel({
      uid: photographers.additionalPhotographerUser._id,
      status: PhotographerStatus.ACTIVE,
      assignedHoardings: 2,
      photosUploaded: 8,
      bio: "Specializing in urban billboard photography with excellent editing skills."
    });
    
    await photographerProfile.save();
    await additionalPhotographerProfile.save();
    
    photographerProfiles.push(photographerProfile, additionalPhotographerProfile);
    
    console.log("Photographer profiles seeded successfully");
    
    return photographerProfiles;
  } catch (error) {
    console.error("Error seeding photographer profiles:", error);
    throw error;
  }
};

// Seed client profiles
const seedClientProfiles = async (clients) => {
  try {
    // Clear existing client profiles
    await ClientModel.deleteMany({});
    
    // Create client profiles
    const clientProfiles = [];
    
    // Main client
    const clientProfile = new ClientModel({
      uid: clients.clientUser._id,
      contactPerson: "John Smith",
      status: ClientStatus.ACTIVE,
      hoardingsCount: 2,
      contractsCount: 2
    });
    
    // Additional client
    const additionalClientProfile = new ClientModel({
      uid: clients.additionalClientUser._id,
      contactPerson: "Sarah Johnson",
      status: ClientStatus.ACTIVE,
      hoardingsCount: 1,
      contractsCount: 1
    });
    
    await clientProfile.save();
    await additionalClientProfile.save();
    
    clientProfiles.push(clientProfile, additionalClientProfile);
    
    console.log("Client profiles seeded successfully");
    
    return clientProfiles;
  } catch (error) {
    console.error("Error seeding client profiles:", error);
    throw error;
  }
};

// Seed hoardings
const seedHoardings = async (ownerUserId) => {
  try {
    // Clear existing hoardings
    await HoardingModel.deleteMany({});
    
    // Create hoardings
    const hoardings = [
      {
        name: "MG Road Billboard",
        hoardingNumber: "H-2023-0001",
        location: {
          address: "MG Road, Near Metro Station",
          city: "Bangalore",
          state: "Karnataka",
          country: "India",
          zipCode: "560001",
          coordinates: {
            latitude: 12.9716,
            longitude: 77.5946
          }
        },
        size: {
          width: 30,
          height: 20,
          unit: "feet"
        },
        dailyRate: 5000,
        status: HoardingStatus.ACTIVE,
        images: ["/uploads/hoardings/hoarding-1.jpg"],
        owner: ownerUserId
      },
      {
        name: "Highway Digital Board",
        hoardingNumber: "H-2023-0002",
        location: {
          address: "NH-48, Near Toll Plaza",
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
          zipCode: "400001",
          coordinates: {
            latitude: 19.0760,
            longitude: 72.8777
          }
        },
        size: {
          width: 40,
          height: 15,
          unit: "feet"
        },
        dailyRate: 7500,
        status: HoardingStatus.ACTIVE,
        images: ["/uploads/hoardings/hoarding-2.jpg"],
        owner: ownerUserId
      },
      {
        name: "Airport Hoarding",
        hoardingNumber: "H-2023-0003",
        location: {
          address: "Airport Road, Near Terminal 3",
          city: "Delhi",
          state: "Delhi",
          country: "India",
          zipCode: "110001",
          coordinates: {
            latitude: 28.5355,
            longitude: 77.2510
          }
        },
        size: {
          width: 50,
          height: 25,
          unit: "feet"
        },
        dailyRate: 10000,
        status: HoardingStatus.ACTIVE,
        images: ["/uploads/hoardings/hoarding-3.jpg"],
        owner: ownerUserId
      },
      {
        name: "Central Mall Display",
        hoardingNumber: "H-2023-0004",
        location: {
          address: "Central Mall, Main Road",
          city: "Chennai",
          state: "Tamil Nadu",
          country: "India",
          zipCode: "600001",
          coordinates: {
            latitude: 13.0827,
            longitude: 80.2707
          }
        },
        size: {
          width: 35,
          height: 18,
          unit: "feet"
        },
        dailyRate: 6500,
        status: HoardingStatus.ACTIVE,
        images: ["/uploads/hoardings/hoarding-4.jpg"],
        owner: ownerUserId
      },
      {
        name: "Railway Station Display",
        hoardingNumber: "H-2023-0005",
        location: {
          address: "Main Railway Station, Platform 1",
          city: "Hyderabad",
          state: "Telangana",
          country: "India",
          zipCode: "500001",
          coordinates: {
            latitude: 17.3850,
            longitude: 78.4867
          }
        },
        size: {
          width: 25,
          height: 15,
          unit: "feet"
        },
        dailyRate: 4500,
        status: HoardingStatus.ACTIVE,
        images: ["/uploads/hoardings/hoarding-5.jpg"],
        owner: ownerUserId
      }
    ];
    
    // Ensure the default hoarding image exists
    const ensureImagePath = () => {
      const uploadsDir = path.join(path.dirname(__filename), '..', 'uploads', 'hoardings');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Create a placeholder image file if it doesn't exist
      for (let i = 1; i <= 5; i++) {
        const imagePath = path.join(uploadsDir, `hoarding-${i}.jpg`);
        if (!fs.existsSync(imagePath)) {
          // Create a placeholder file
          fs.writeFileSync(imagePath, 'placeholder image');
        }
      }
    };
    
    // Ensure default image exists
    ensureImagePath();
    
    const createdHoardings = await HoardingModel.insertMany(hoardings);
    console.log("Hoardings seeded successfully");
    return createdHoardings;
  } catch (error) {
    console.error("Error seeding hoardings:", error);
    throw error;
  }
};

// Seed assignments
const seedAssignments = async (hoardings, photographers, ownerId) => {
  try {
    // Clear existing assignments
    await AssignmentModel.deleteMany({});
    
    // Create assignments
    const assignments = [
      {
        hoarding: hoardings[0]._id,
        photographer: photographers.photographerUser._id,
        assignedBy: ownerId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        notes: "Take photos of the new advertisement for Coca Cola",
        status: AssignmentStatus.ASSIGNED
      },
      {
        hoarding: hoardings[1]._id,
        photographer: photographers.photographerUser._id,
        assignedBy: ownerId,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        notes: "Capture the new Samsung billboard from different angles",
        status: AssignmentStatus.IN_PROGRESS
      },
      {
        hoarding: hoardings[2]._id,
        photographer: photographers.photographerUser._id,
        assignedBy: ownerId,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        notes: "Take photos at night to show illumination",
        status: AssignmentStatus.COMPLETED
      },
      {
        hoarding: hoardings[3]._id,
        photographer: photographers.additionalPhotographerUser._id,
        assignedBy: ownerId,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        notes: "Take wide-angle photos during peak traffic hours",
        status: AssignmentStatus.ASSIGNED
      },
      {
        hoarding: hoardings[4]._id,
        photographer: photographers.additionalPhotographerUser._id,
        assignedBy: ownerId,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        notes: "Capture during morning rush hour",
        status: AssignmentStatus.COMPLETED
      }
    ];
    
    const createdAssignments = await AssignmentModel.insertMany(assignments);
    console.log("Assignments seeded successfully");
    return createdAssignments;
  } catch (error) {
    console.error("Error seeding assignments:", error);
    throw error;
  }
};

// Seed photos
const seedPhotos = async (assignments, photographers) => {
  try {
    // Clear existing photos
    await PhotoModel.deleteMany({});
    
    // Create photos for completed assignments
    const completedAssignments = assignments.filter(a => a.status === AssignmentStatus.COMPLETED);
    
    // Ensure the uploads/photos directory exists
    const photosDir = path.join(path.dirname(__filename), '..', 'uploads', 'photos');
    if (!fs.existsSync(photosDir)) {
      fs.mkdirSync(photosDir, { recursive: true });
    }
    
    // Create placeholder photos
    const createPlaceholderPhoto = (index) => {
      const filePath = path.join(photosDir, `photo-${index}.jpg`);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, 'placeholder photo');
      }
      return `/uploads/photos/photo-${index}.jpg`;
    };
    
    const photos = [];
    
    completedAssignments.forEach((assignment, idx) => {
      // Create 3 photos for each completed assignment
      for (let i = 1; i <= 3; i++) {
        const photoIndex = (idx * 3) + i;
        const filePath = createPlaceholderPhoto(photoIndex);
        const fileName = `photo-${photoIndex}.jpg`;
        
        photos.push({
          fileName: fileName,
          filePath: filePath,
          assignment: assignment._id,
          hoarding: assignment.hoarding,
          uploadedBy: assignment.photographer, // Use photographer as uploadedBy
          caption: `Photo ${i} of hoarding ${assignment.hoarding}`,
          takenAt: new Date(Date.now() - (Math.random() * 10) * 24 * 60 * 60 * 1000), // Random date within last 10 days
          status: PhotoStatus.APPROVED,
          metadata: {
            size: Math.floor(Math.random() * 5000000) + 1000000, // Random size between 1MB and 6MB
            width: 1920,
            height: 1080,
            format: 'jpg'
          }
        });
      }
    });
    
    // Create some photos for in-progress assignments too
    const inProgressAssignments = assignments.filter(a => a.status === AssignmentStatus.IN_PROGRESS);
    
    inProgressAssignments.forEach((assignment, idx) => {
      // Create 2 photos for each in-progress assignment
      for (let i = 1; i <= 2; i++) {
        const photoIndex = 20 + (idx * 2) + i; // Start from higher index to avoid conflicts
        const filePath = createPlaceholderPhoto(photoIndex);
        const fileName = `photo-${photoIndex}.jpg`;
        
        photos.push({
          fileName: fileName,
          filePath: filePath,
          assignment: assignment._id,
          hoarding: assignment.hoarding,
          uploadedBy: assignment.photographer, // Use photographer as uploadedBy
          caption: `In-progress photo ${i} of hoarding ${assignment.hoarding}`,
          takenAt: new Date(Date.now() - (Math.random() * 3) * 24 * 60 * 60 * 1000), // Random date within last 3 days
          status: PhotoStatus.PENDING,
          metadata: {
            size: Math.floor(Math.random() * 5000000) + 1000000, // Random size between 1MB and 6MB
            width: 1920,
            height: 1080,
            format: 'jpg'
          }
        });
      }
    });
    
    const createdPhotos = await PhotoModel.insertMany(photos);
    console.log("Photos seeded successfully");
    return createdPhotos;
  } catch (error) {
    console.error("Error seeding photos:", error);
    throw error;
  }
};

// Seed contracts
const seedContracts = async (hoardings, clients, ownerId) => {
  try {
    // Clear existing contracts
    await ContractModel.deleteMany({});
    
    // Create contracts
    const contracts = [
      {
        hoarding: hoardings[0]._id,
        client: clients.clientUser._id,
        owner: ownerId,
        contractNumber: "CON-2023-0001",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        totalAmount: 150000, // 30 days * 5000 daily rate
        status: ContractStatus.ACTIVE,
        termsAndConditions: "Standard terms and conditions apply."
      },
      {
        hoarding: hoardings[1]._id,
        client: clients.clientUser._id,
        owner: ownerId,
        contractNumber: "CON-2023-0002",
        startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        endDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days from now
        totalAmount: 225000, // 30 days * 7500 daily rate
        status: ContractStatus.PENDING,
        termsAndConditions: "Payment must be made in advance."
      },
      {
        hoarding: hoardings[2]._id,
        client: clients.additionalClientUser._id,
        owner: ownerId,
        contractNumber: "CON-2023-0003",
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        totalAmount: 300000, // 30 days * 10000 daily rate
        status: ContractStatus.ACTIVE,
        termsAndConditions: "Premium location with guaranteed visibility."
      }
    ];
    
    const createdContracts = await ContractModel.insertMany(contracts);
    console.log("Contracts seeded successfully");
    return createdContracts;
  } catch (error) {
    console.error("Error seeding contracts:", error);
    throw error;
  }
};

// Seed invoices
const seedInvoices = async (contracts, clients, ownerId) => {
  try {
    // Clear existing invoices
    await BillingModel.deleteMany({});
    
    // Create invoices
    const invoices = [
      {
        contract: contracts[0]._id,
        client: clients.clientUser._id,
        owner: ownerId,
        amount: 150000,
        paymentStatus: PaymentStatus.PENDING,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        invoiceNumber: "INV-2023-0001",
        notes: "Please pay by bank transfer"
      },
      {
        contract: contracts[1]._id,
        client: clients.clientUser._id,
        owner: ownerId,
        amount: 225000,
        paymentStatus: PaymentStatus.PENDING,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        invoiceNumber: "INV-2023-0002",
        notes: "Payment must be made before the contract starts"
      },
      {
        contract: contracts[2]._id,
        client: clients.additionalClientUser._id,
        owner: ownerId,
        amount: 150000, // First half of the payment
        paymentStatus: PaymentStatus.PAID,
        dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        paymentDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
        paymentMethod: "Credit Card",
        transactionId: "TXID12345678",
        invoiceNumber: "INV-2023-0003",
        notes: "First installment"
      },
      {
        contract: contracts[2]._id,
        client: clients.additionalClientUser._id,
        owner: ownerId,
        amount: 150000, // Second half of the payment
        paymentStatus: PaymentStatus.OVERDUE,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        invoiceNumber: "INV-2023-0004",
        notes: "Second installment"
      }
    ];
    
    // Save invoices
    const savedInvoices = await BillingModel.insertMany(invoices);
    
    console.log("Invoices seeded successfully");
    return savedInvoices;
  } catch (error) {
    console.error("Error seeding invoices:", error);
    throw error;
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    const users = await seedUsers();
    
    // Create photographer and client profiles
    const photographerProfiles = await seedPhotographerProfiles({
      photographerUser: users.photographerUser,
      additionalPhotographerUser: users.additionalPhotographerUser
    });
    
    const clientProfiles = await seedClientProfiles({
      clientUser: users.clientUser,
      additionalClientUser: users.additionalClientUser
    });
    
    const hoardings = await seedHoardings(users.ownerUser._id);
    
    const assignments = await seedAssignments(
      hoardings, 
      {
        photographerUser: users.photographerUser,
        additionalPhotographerUser: users.additionalPhotographerUser
      }, 
      users.ownerUser._id
    );
    
    // Seed photos
    const photos = await seedPhotos(
      assignments, 
      {
        photographerUser: users.photographerUser,
        additionalPhotographerUser: users.additionalPhotographerUser
      }
    );
    
    const contracts = await seedContracts(
      hoardings, 
      {
        clientUser: users.clientUser,
        additionalClientUser: users.additionalClientUser
      }, 
      users.ownerUser._id
    );
    
    const invoices = await seedInvoices(
      contracts, 
      {
        clientUser: users.clientUser,
        additionalClientUser: users.additionalClientUser
      }, 
      users.ownerUser._id
    );
    
    console.log("Database seeded successfully!");
    
    // Don't close the connection when called from server
    if (process.argv[1] === fileURLToPath(import.meta.url)) {
      mongoose.connection.close();
    }
    
    return {
      ownerUser: users.ownerUser,
      photographerUser: users.photographerUser,
      clientUser: users.clientUser,
      additionalPhotographerUser: users.additionalPhotographerUser,
      additionalClientUser: users.additionalClientUser,
      photographerProfiles,
      clientProfiles,
      hoardings,
      assignments,
      photos,
      contracts,
      invoices
    };
  } catch (error) {
    console.error("Seed error:", error);
    
    // Only close if run directly
    if (process.argv[1] === fileURLToPath(import.meta.url)) {
      mongoose.connection.close();
      process.exit(1);
    }
    throw error;
  }
};

export { seedDatabase };

// If this script is run directly (not imported)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase();
}
