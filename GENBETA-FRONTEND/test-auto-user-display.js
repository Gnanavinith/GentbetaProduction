// Test script to check auto-user field display behavior
const testAutoUserDisplay = () => {
  console.log('Testing auto-user field display behavior...');
  
  // Simulate user data from AuthContext
  const mockUser = {
    _id: "677eb45c44b60f61b60c63c",
    name: "Test User",
    email: "test@example.com",
    role: "EMPLOYEE",
    employeeID: "EMP001",
    department: "Engineering",
    phoneNumber: "123-456-7890",
    position: "Software Engineer"
  };
  
  // Simulate auto-user field configuration
  const autoUserField = {
    type: "auto-user",
    fields: ["name", "email", "role", "employeeID", "department"]
  };
  
  // Create user data object based on requested fields
  const userData = {};
  autoUserField.fields.forEach(f => {
    switch(f) {
      case "name":
        userData.name = mockUser?.name || "";
        break;
      case "email":
        userData.email = mockUser?.email || "";
        break;
      case "role":
        userData.role = mockUser?.role || "";
        break;
      case "id":
        userData.id = mockUser?._id || "";
        break;
      case "employeeID":
        userData.employeeID = mockUser?.employeeID || mockUser?._id || "";
        break;
      case "department":
        userData.department = mockUser?.department || "";
        break;
      case "phoneNumber":
        userData.phoneNumber = mockUser?.phoneNumber || "";
        break;
      case "position":
        userData.position = mockUser?.position || "";
        break;
      default:
        userData[f] = mockUser?.[f] || "";
    }
  });
  
  console.log('Generated user data:', userData);
  console.log('User data keys:', Object.keys(userData));
  console.log('User data values:', Object.values(userData));
  
  // Test the display logic
  const displayFields = autoUserField.fields || ["name", "email", "role"];
  console.log('\nDisplay fields:', displayFields);
  
  displayFields.forEach((field, index) => {
    const value = userData[field] || "N/A";
    console.log(`${field}: ${value}`);
  });
  
  // Test the shouldAutoFill condition
  const testValues = [
    null,
    undefined,
    {},
    { name: "" },
    { name: "John" },
    ""
  ];
  
  console.log('\nTesting shouldAutoFill conditions:');
  testValues.forEach((testValue, index) => {
    const shouldAutoFill = !testValue || Object.keys(testValue).length === 0 || 
                          (typeof testValue === 'object' && Object.keys(testValue).length === 0);
    console.log(`Value ${index + 1}:`, testValue, '-> shouldAutoFill:', shouldAutoFill);
  });
  
  return {
    userData,
    displayFields,
    isEmpty: Object.keys(userData).length === 0
  };
};

// Run the test
const result = testAutoUserDisplay();
console.log('\nTest Result:', result);