import { connectToDB, User } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function seedUsers() {
  try {
    await connectToDB();
    
    // Clear existing users
    await User.deleteMany({});
    
    // Sample users
    const users = [
      {
        name: 'Fathima',
        email: 'fathima@example.com',
        password: 'password123',
        role: 'engineer',
        employeeId: 'ENG-001',
        site: 'Site A',
        allocatedSites: [],
        isActive: true
      },
      {
        name: 'John Doe',
        email: 'engineer@example.com',
        password: 'password123',
        role: 'engineer',
        employeeId: 'ENG-002',
        site: 'Site B',
        allocatedSites: [],
        isActive: true
      },
      {
        name: 'Jane Smith',
        email: 'pm@example.com',
        password: 'password123',
        role: 'project_manager',
        employeeId: 'PM-001',
        site: 'Main Office',
        allocatedSites: ['Site A', 'Site B', 'Site C'],
        isActive: true
      },
      {
        name: 'Mike Johnson',
        email: 'pm2@example.com',
        password: 'password123',
        role: 'project_manager',
        employeeId: 'PM-002',
        site: 'Main Office',
        allocatedSites: ['Site D', 'Site E'],
        isActive: true
      },
      {
        name: 'Sarah Wilson',
        email: 'hr@example.com',
        password: 'password123',
        role: 'hr',
        employeeId: 'HR-001',
        site: 'Main Office',
        allocatedSites: [],
        isActive: true
      },
      {
        name: 'Robert Brown',
        email: 'engineer2@example.com',
        password: 'password123',
        role: 'engineer',
        employeeId: 'ENG-003',
        site: 'Site C',
        allocatedSites: [],
        isActive: true
      },
      {
        name: 'Emily Davis',
        email: 'engineer3@example.com',
        password: 'password123',
        role: 'engineer',
        employeeId: 'ENG-004',
        site: 'Site A',
        allocatedSites: [],
        isActive: true
      }
    ];

    // Insert users
    const insertedUsers = await User.insertMany(users);
    
    console.log('✅ Users seeded successfully!');
    console.log(`Created ${insertedUsers.length} users:`);
    
    insertedUsers.forEach(user => {
      console.log(`- ${user.name} (${user.role}) - ${user.email}`);
    });

    console.log('\n🔑 Login Credentials:');
    console.log('Email: fathima@example.com | Password: password123 (Engineer)');
    console.log('Email: pm@example.com | Password: password123 (Project Manager)');
    console.log('Email: hr@example.com | Password: password123 (HR)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
