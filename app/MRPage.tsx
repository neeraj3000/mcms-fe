import React, { useEffect } from 'react';
import { useSession } from '../src/SessionContext'; // Import session context
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { DrawerNavigationProp } from '@react-navigation/drawer'; // Importing for typing the navigation prop
import { useNavigation } from '@react-navigation/native'; // Required for `navigation.replace`
import StudentHomePage from '../src/screens/Student/Student';
import FeedbackForm from '../src/screens/Student/FeedbackScreen';
import ReportIssue from '../src/screens/Student/IssueReportScreen';
import IssueHistory from '../src/screens/Student/HistoryScreen';
import AllIssues from '../src/screens/Student/AllIssuesScreen';
import RepresentativePage from '../src/screens/Representative/RepresentativePage';
import QualityInspection from '../src/screens/Representative/QualityInspection';
import ViewIssues from '../src/screens/Representative/ViewIssues';
import { Ionicons } from "@expo/vector-icons";

const Drawer = createDrawerNavigator();

type StudentPageNavigationProp = DrawerNavigationProp<any>; // Define navigation prop type for StudentPage

const CustomDrawerContent = (props: any) => {
  const { logout } = useSession(); // Access logout function from session context
  const navigation = useNavigation<StudentPageNavigationProp>(); // Ensure navigation typing

  const handleLogout = () => {
    logout(); // Clear session data
    navigation.replace('Login'); // Use replace to prevent going back to the previous screen
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />

      <DrawerItem
        label="Logout"
        onPress={handleLogout}
        style={{
          marginTop: 'auto',
          backgroundColor: '#007BFF', // Highlight with blue background
          borderRadius: 5, // Rounded corners
        }}
        labelStyle={{
          color: 'white', // White text color for contrast
          fontWeight: 'bold', // Bold text for emphasis
        }}
        icon={() => <Ionicons name="log-out-outline" size={24} color="white" />} // Custom logout icon
      />
    </DrawerContentScrollView>
  );
};

type StudentPageProps = {
  navigation: StudentPageNavigationProp;
};

const MRPage = ({ navigation }: StudentPageProps) => {
  const { user } = useSession(); // Access session data

  useEffect(() => {
    if (!user) {
      navigation.replace('Login'); // Redirect to Login if not authenticated
    }
  }, [user, navigation]);

  return (
    <Drawer.Navigator
      initialRouteName="RepresentativePage"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTitle: 'Menu', // Set header title as 'Menu' for each screen
        drawerStyle: {
          backgroundColor: "#fff",
          width: 240,
        },
        drawerLabelStyle: {
          fontWeight: 'bold', // Bold labels in the drawer
        },
        drawerHeaderStyle: {
          backgroundColor: '#007BFF', // Set background color for drawer header
          height: 120, // Set height of the header
        },
        drawerHeaderTitleStyle: {
          color: 'white', // Set color of the title text to white
          fontSize: 22, // Increase font size for the title
          fontWeight: 'bold', // Make title bold
        },
      }}
    >
      <Drawer.Screen name="RepresentativePage" component={RepresentativePage} options={{ title: 'Home' }} />
      <Drawer.Screen name="QualityInspection" component={QualityInspection} options={{ title: 'Quality Inspection' }} />
      <Drawer.Screen name="Feedback" component={FeedbackForm} />
      <Drawer.Screen
      name="ReportIssue" // Updated name
      component={ReportIssue}
      options={{ title: 'Report Issue' }} // Friendly title
    />
      <Drawer.Screen name="View History" component={IssueHistory} />
      <Drawer.Screen name="View Issues" component={ViewIssues} />
    </Drawer.Navigator>
  );
};

export default MRPage;
