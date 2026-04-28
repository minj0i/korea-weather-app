import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

interface Props {
  icon: string;
  label: string;
  value: string;
}

export function StatCard({ icon, label, value }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon:  { fontSize: 28 },
  value: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  label: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
});
