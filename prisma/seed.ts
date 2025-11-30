import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Create Company
  console.log('🏢 Creating company...')
  const company = await prisma.company.upsert({
    where: { code: 'MAIN' },
    update: {},
    create: {
      name: 'Sustainesia Digital',
      code: 'MAIN',
      address: 'Jl. Sudirman No.1, Jakarta Pusat',
      phone: '+62-21-12345678',
      email: 'info@sustainesia.com',
      website: 'https://sustainesia.com',
      description: 'Leading company in sustainable digital solutions with strong CSR commitment',
      status: 'active'
    }
  })

  // 2. Create Departments
  console.log('🏛️ Creating departments...')
  const csrDept = await prisma.department.upsert({
    where: { code: 'CSR' },
    update: {},
    create: {
      name: 'CSR & Community Development',
      code: 'CSR',
      description: 'Department responsible for Corporate Social Responsibility programs'
    }
  })

  const hrDept = await prisma.department.upsert({
    where: { code: 'HR' },
    update: {},
    create: {
      name: 'Human Resources',
      code: 'HR',
      description: 'Human resource management and employee development'
    }
  })

  const finDept = await prisma.department.upsert({
    where: { code: 'FIN' },
    update: {},
    create: {
      name: 'Finance',
      code: 'FIN',
      description: 'Financial management and budget control'
    }
  })

  // 3. Create Roles
  console.log('👥 Creating roles...')
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      permissions: JSON.stringify(['*']),
      level: 'super_admin'
    }
  })

  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Administrative access to manage CSR programs',
      permissions: JSON.stringify(['program.*', 'stakeholder.*', 'budget.*', 'report.*']),
      level: 'admin'
    }
  })

  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: {
      name: 'Manager',
      description: 'Manage programs and view reports',
      permissions: JSON.stringify(['program.read', 'program.update', 'stakeholder.read', 'budget.read', 'report.read']),
      level: 'manager'
    }
  })

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: {
      name: 'User',
      description: 'Basic user access to view programs',
      permissions: JSON.stringify(['program.read', 'stakeholder.read']),
      level: 'user'
    }
  })

  // 4. Create Users
  console.log('👤 Creating users...')
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sustainesia.com' },
    update: {},
    create: {
      email: 'admin@sustainesia.com',
      password: hashedPassword,
      name: 'Admin Sustainesia',
      position: 'CSR Administrator',
      employeeId: 'EMP001',
      departmentId: csrDept.id,
      roleId: superAdminRole.id,
      status: 'active'
    }
  })

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@sustainesia.com' },
    update: {},
    create: {
      email: 'manager@sustainesia.com',
      password: hashedPassword,
      name: 'CSR Manager',
      position: 'Program Manager',
      employeeId: 'EMP002',
      departmentId: csrDept.id,
      roleId: managerRole.id,
      status: 'active'
    }
  })

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@sustainesia.com' },
    update: {},
    create: {
      email: 'demo@sustainesia.com',
      password: hashedPassword,
      name: 'Demo User',
      position: 'Staff',
      employeeId: 'EMP003',
      departmentId: csrDept.id,
      roleId: userRole.id,
      status: 'active'
    }
  })

  // 5. Create Program Categories
  console.log('📝 Creating program categories...')
  const educationCategory = await prisma.categoryProgram.upsert({
    where: { name: 'Pendidikan' },
    update: {},
    create: { 
      name: 'Pendidikan',
      description: 'Program pengembangan pendidikan dan literasi',
      color: '#3B82F6',
      icon: 'book'
    }
  })

  const healthCategory = await prisma.categoryProgram.upsert({
    where: { name: 'Kesehatan' },
    update: {},
    create: { 
      name: 'Kesehatan',
      description: 'Program kesehatan masyarakat',
      color: '#10B981',
      icon: 'heart'
    }
  })

  const environmentCategory = await prisma.categoryProgram.upsert({
    where: { name: 'Lingkungan' },
    update: {},
    create: { 
      name: 'Lingkungan',
      description: 'Program pelestarian lingkungan',
      color: '#22C55E',
      icon: 'tree'
    }
  })

  const economicCategory = await prisma.categoryProgram.upsert({
    where: { name: 'Ekonomi' },
    update: {},
    create: { 
      name: 'Ekonomi',
      description: 'Program pemberdayaan ekonomi masyarakat',
      color: '#F59E0B',
      icon: 'dollar'
    }
  })

  const socialCategory = await prisma.categoryProgram.upsert({
    where: { name: 'Sosial' },
    update: {},
    create: { 
      name: 'Sosial',
      description: 'Program pengembangan sosial kemasyarakatan',
      color: '#8B5CF6',
      icon: 'users'
    }
  })

  // 6. Create Program Types
  console.log('📝 Creating program types...')
  const strategicType = await prisma.typeProgram.upsert({
    where: { name: 'Strategis' },
    update: {},
    create: { 
      name: 'Strategis',
      description: 'Program CSR strategis jangka panjang',
      duration: 'long_term'
    }
  })

  const grantType = await prisma.typeProgram.upsert({
    where: { name: 'Bantuan' },
    update: {},
    create: { 
      name: 'Bantuan',
      description: 'Program bantuan dan donasi',
      duration: 'short_term'
    }
  })

  const scholarshipType = await prisma.typeProgram.upsert({
    where: { name: 'Beasiswa' },
    update: {},
    create: { 
      name: 'Beasiswa',
      description: 'Program beasiswa pendidikan',
      duration: 'long_term'
    }
  })

  const trainingType = await prisma.typeProgram.upsert({
    where: { name: 'Pelatihan' },
    update: {},
    create: { 
      name: 'Pelatihan',
      description: 'Program pelatihan dan capacity building',
      duration: 'short_term'
    }
  })

  const infrastructureType = await prisma.typeProgram.upsert({
    where: { name: 'Infrastruktur' },
    update: {},
    create: { 
      name: 'Infrastruktur',
      description: 'Program pembangunan infrastruktur',
      duration: 'long_term'
    }
  })

  // 7. Create Stakeholder Categories
  console.log('🏷️ Creating stakeholder categories...')
  const communityCategory = await prisma.stakeholderCategory.upsert({
    where: { name: 'Community' },
    update: {},
    create: {
      name: 'Community',
      description: 'Local community and public',
      type: 'community'
    }
  })

  const ngoCategory = await prisma.stakeholderCategory.upsert({
    where: { name: 'NGO/Yayasan' },
    update: {},
    create: {
      name: 'NGO/Yayasan',
      description: 'Non-Government Organizations and foundations',
      type: 'external'
    }
  })

  const govCategory = await prisma.stakeholderCategory.upsert({
    where: { name: 'Pemerintah' },
    update: {},
    create: {
      name: 'Pemerintah',
      description: 'Government institutions',
      type: 'government'
    }
  })

  const internalCategory = await prisma.stakeholderCategory.upsert({
    where: { name: 'Internal' },
    update: {},
    create: {
      name: 'Internal',
      description: 'Internal company stakeholders',
      type: 'internal'
    }
  })

  // 8. Create Stakeholders
  console.log('🤝 Creating stakeholders...')
  const communityStakeholder = await prisma.stakeholder.create({
    data: {
      name: 'Komunitas Tani Organik Bandung',
      type: 'community',
      categoryId: communityCategory.id,
      contact: 'Pak Sartono',
      phone: '+62-812-3456-7890',
      address: 'Bandung, Jawa Barat',
      description: 'Kelompok tani organik yang fokus pada pertanian berkelanjutan',
      importance: 'high',
      influence: 'medium',
      relationship: 'supporter',
      contactPersonId: managerUser.id
    }
  })

  const ngoStakeholder = await prisma.stakeholder.create({
    data: {
      name: 'Yayasan Pendidikan Nusantara',
      type: 'organization',
      categoryId: ngoCategory.id,
      contact: 'Dr. Siti Nurhaliza',
      email: 'info@ypn.org',
      phone: '+62-21-9876-5432',
      address: 'Jakarta Pusat',
      description: 'NGO yang fokus pada pengembangan pendidikan di daerah terpencil',
      importance: 'high',
      influence: 'high',
      relationship: 'supporter'
    }
  })

  // 9. Create Programs
  console.log('📋 Creating programs...')
  const educationProgram = await prisma.program.create({
    data: {
      name: 'Program Pemberdayaan Pendidikan Desa',
      description: 'Program CSR yang fokus pada peningkatan kualitas pendidikan di daerah terpencil melalui pembangunan perpustakaan digital dan pelatihan guru.',
      categoryId: educationCategory.id,
      typeId: strategicType.id,
      status: 'active',
      priority: 'high',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      targetBeneficiary: 1000,
      targetArea: 'Jawa Barat, Jawa Tengah, Jawa Timur',
      objectives: 'Meningkatkan akses pendidikan berkualitas untuk 1000 siswa di daerah terpencil',
      expectedOutcome: 'Terbentuknya 10 perpustakaan digital dan 100 guru terlatih',
      departmentId: csrDept.id,
      createdById: adminUser.id,
      approvedAt: new Date('2024-01-15'),
      approvedBy: adminUser.id
    }
  })

  const healthProgram = await prisma.program.create({
    data: {
      name: 'Program Kesehatan Ibu dan Anak',
      description: 'Program pembangunan fasilitas kesehatan dan pelatihan tenaga medis untuk meningkatkan kesehatan ibu dan anak',
      categoryId: healthCategory.id,
      typeId: strategicType.id,
      status: 'active',
      priority: 'high',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-11-30'),
      targetBeneficiary: 5000,
      targetArea: 'Jawa Timur dan Bali',
      objectives: 'Menurunkan angka kematian ibu dan anak',
      expectedOutcome: '5 klinik dibangun dan 50 tenaga medis terlatih',
      departmentId: csrDept.id,
      createdById: managerUser.id,
      approvedAt: new Date('2024-02-10'),
      approvedBy: adminUser.id
    }
  })

  const environmentProgram = await prisma.program.create({
    data: {
      name: 'Program Konservasi Mangrove',
      description: 'Penanaman dan konservasi hutan mangrove untuk ekosistem pesisir',
      categoryId: environmentCategory.id,
      typeId: infrastructureType.id,
      status: 'active',
      priority: 'medium',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-12-31'),
      targetBeneficiary: 2000,
      targetArea: 'Pesisir Jawa Timur dan Bali',
      objectives: 'Menanam 10,000 pohon mangrove',
      expectedOutcome: 'Pemulihan 20 hektar lahan pesisir',
      departmentId: csrDept.id,
      createdById: managerUser.id
    }
  })

  // 10. Create Projects
  console.log('🚀 Creating projects...')
  const libraryProject = await prisma.project.create({
    data: {
      name: 'Pembangunan Perpustakaan Digital',
      description: 'Membangun perpustakaan digital di 10 sekolah dasar',
      status: 'active',
      progress: 65,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-08-31'),
      budget: 300000000,
      actualCost: 195000000,
      programId: educationProgram.id
    }
  })

  const clinicProject = await prisma.project.create({
    data: {
      name: 'Klinik Kesehatan Ibu dan Anak',
      description: 'Pembangunan dan operasional klinik kesehatan',
      status: 'active',
      progress: 40,
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-10-31'),
      budget: 500000000,
      actualCost: 200000000,
      programId: healthProgram.id
    }
  })

  // 11. Create Activities
  console.log('⚡ Creating activities...')
  const workshopActivity = await prisma.activity.create({
    data: {
      name: 'Workshop Literasi Digital untuk Guru',
      description: 'Pelatihan penggunaan teknologi dalam pembelajaran',
      type: 'training',
      status: 'completed',
      priority: 'high',
      startDate: new Date('2024-05-15'),
      endDate: new Date('2024-05-17'),
      location: 'Bandung, Jawa Barat',
      participants: 45,
      budget: 25000000,
      actualCost: 23000000,
      progress: 100,
      projectId: libraryProject.id,
      departmentId: csrDept.id,
      assignedToId: managerUser.id
    }
  })

  // 12. Create Budgets
  console.log('💰 Creating budgets...')
  const educationBudget = await prisma.budget.create({
    data: {
      name: 'Budget Program Pendidikan 2024',
      type: 'program',
      category: 'operational',
      amount: 500000000,
      currency: 'IDR',
      status: 'approved',
      approvedAmount: 500000000,
      spentAmount: 125000000,
      period: '2024',
      departmentId: csrDept.id,
      programId: educationProgram.id,
      approvedAt: new Date('2024-01-20'),
      approvedBy: adminUser.id
    }
  })

  // 13. Create Program-Stakeholder relationships
  console.log('🔗 Creating relationships...')
  await prisma.programStakeholder.create({
    data: {
      programId: educationProgram.id,
      stakeholderId: ngoStakeholder.id,
      role: 'partner',
      engagement: 'high',
      expectation: 'Kerjasama dalam implementasi program pendidikan'
    }
  })

  await prisma.programStakeholder.create({
    data: {
      programId: environmentProgram.id,
      stakeholderId: communityStakeholder.id,
      role: 'beneficiary',
      engagement: 'medium',
      expectation: 'Mendapatkan manfaat dari program konservasi'
    }
  })

  console.log('✅ Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log({
    'Companies': await prisma.company.count(),
    'Departments': await prisma.department.count(),
    'Roles': await prisma.role.count(),
    'Users': await prisma.user.count(),
    'Program Categories': await prisma.categoryProgram.count(),
    'Program Types': await prisma.typeProgram.count(),
    'Programs': await prisma.program.count(),
    'Projects': await prisma.project.count(),
    'Activities': await prisma.activity.count(),
    'Stakeholders': await prisma.stakeholder.count(),
    'Budgets': await prisma.budget.count(),
  })

  console.log('\n🔑 Demo Credentials:')
  console.log('Email: admin@sustainesia.com | Password: password123 (Super Admin)')
  console.log('Email: manager@sustainesia.com | Password: password123 (Manager)')
  console.log('Email: demo@sustainesia.com | Password: password123 (User)')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })