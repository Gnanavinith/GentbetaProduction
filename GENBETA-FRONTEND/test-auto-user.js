// Test script to debug auto-user field issue
const testAutoUserField = () => {
  console.log('Testing auto-user field behavior...');
  
  // Simulate user data from AuthContext
  const mockUser = {
    _id: "677eb45c44b60f61b60c63c",
    name: "Test User",
    email: "test@example.com",
    role: "EMPLOYEE",
    employeeID: "EMP001",
    department: "Engineering"
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
  
  // Test formatting function
  const formatFieldValue = (value, fieldType = "text") => {
    // Handle null/undefined/empty values
    if (value === null || value === undefined || value === "") {
      return "—";
    }
    
    // Handle arrays (checkbox, multiple select)
    if (Array.isArray(value)) {
      if (value.length === 0) return "—";
      return value.join(", ");
    }
    
    // Handle objects (file uploads, complex data)
    if (typeof value === "object") {
      // Auto-user object
      if (fieldType === "auto-user" && value.name) {
        const userFields = [];
        if (value.name) userFields.push(`Name: ${value.name}`);
        if (value.email) userFields.push(`Email: ${value.email}`);
        if (value.role) userFields.push(`Role: ${value.role}`);
        if (value.employeeID) userFields.push(`Employee ID: ${value.employeeID}`);
        if (value.department) userFields.push(`Department: ${value.department}`);
        return userFields.join(" | ");
      }
      
      // File objects
      if (value.url && value.filename) {
        return value.url;
      }
      
      // Generic object handling
      try {
        return JSON.stringify(value, null, 2);
      } catch (e) {
        return String(value);
      }
    }
    
    // Handle dates
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    // Handle booleans
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    
    // Handle numbers
    if (typeof value === "number") {
      return String(value);
    }
    
    // Default string handling
    return String(value);
  };
  
  const formattedValue = formatFieldValue(userData, "auto-user");
  console.log('Formatted value:', formattedValue);
  
  return {
    userData,
    formattedValue,
    isEmpty: Object.keys(userData).length === 0
  };
};

// Run the test
const result = testAutoUserField();
console.log('\nTest Result:', result);