import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TicketsStackParamList } from './types';
import TicketsListScreen from '../features/tickets/screens/TicketsListScreen';
import TicketDetailScreen from '../features/tickets/screens/TicketDetailScreen';
import CreateTicketScreen from '../features/tickets/screens/CreateTicketScreen';

const Stack = createNativeStackNavigator<TicketsStackParamList>();

export default function TicketsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TicketsList" component={TicketsListScreen} options={{ title: 'My Tickets' }} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ title: 'Ticket Details' }} />
      <Stack.Screen name="CreateTicket" component={CreateTicketScreen} options={{ title: 'Raise Ticket' }} />
    </Stack.Navigator>
  );
}
