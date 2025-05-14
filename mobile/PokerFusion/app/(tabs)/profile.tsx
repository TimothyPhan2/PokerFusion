import { AuthController } from "@/controllers/auth";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth";
import Colors from "../../constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
export default function Profile() {
  const [refreshing, setRefreshing] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const username = isAuthenticated.user?.username;
  const email = isAuthenticated.user?.email;
  const profileImage = isAuthenticated.user?.profile_image;
  const gameHistory = isAuthenticated.user?.game_history;

  // Calculate statistics
  const gamesPlayed = gameHistory?.length || 0;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const refreshGameHistory = async () => {
      try {
        const { getGameHistory } = useAuthStore.getState();
        await getGameHistory();
      } catch (error) {
        console.log("Failed to refresh game history")
      }
      finally {
        setRefreshing(false);
      }
    }
    refreshGameHistory();
  }, []);

  const handleLogout = () => {
    AuthController.handleLogout();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color={Colors.text.white} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={Colors.action.gold.medium}
            colors={[Colors.action.gold.medium]}
          />
        }
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.username}>{username}</Text>
              <Text style={styles.email}>{email}</Text>

            </View>
          </View>
        </View>

        {/* Statistics Card */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons
              name="cards-playing-outline"
              size={24}
              color={Colors.action.blue.light}
              style={styles.statIcon}
            />
            <Text style={styles.statValue}>{gamesPlayed}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>
        </View>

        {/* Game History */}
        <View style={styles.historyTitleContainer}>
          <Text style={styles.historyTitleText}>Game History</Text>
        </View>

        <View style={styles.historyContainer}>
          {gameHistory && gameHistory.length > 0 ? (
            [...gameHistory].reverse().map((game) => (
              <View key={game.gameId} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <View style={styles.historyIconContainer}>
                    <MaterialCommunityIcons
                      name={game.amount > 0 ? "trophy-outline" : "close-circle-outline"}
                      size={24}
                      color={game.amount > 0 ? Colors.action.gold.medium : Colors.action.red.medium}
                    />
                  </View>
                  <View>
                    <Text style={styles.historyTitle}>
                      {game.amount > 0 ? "Won" : "Lost"} Poker Game
                    </Text>
                    <Text style={styles.historyDate}>
                      {game.date}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.historyAmount,
                    { color: game.amount > 0 ? Colors.action.green.light : Colors.action.red.light },
                  ]}
                >
                  {game.amount > 0 ? "+" : ""}
                  {game.amount}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="cards" size={60} color={Colors.text.gray} style={styles.emptyStateIcon} />
              <Text style={styles.emptyStateText}>No games played yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Your game history will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.table.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary.light,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.medium,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: Colors.text.white,
    marginLeft: 6,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    backgroundColor: Colors.primary.medium,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.utility.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary.light,
    borderWidth: 3,
    borderColor: Colors.action.blue.medium,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.action.gold.medium,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary.medium,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text.white,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.text.gray,
    marginBottom: 12,
  },
  profileActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  editProfileButton: {
    backgroundColor: Colors.action.blue.dark,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editProfileText: {
    color: Colors.text.white,
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.primary.medium,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: Colors.utility.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.gray,
    textAlign: 'center',
  },
  historyTitleContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  historyTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  historyContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  historyItem: {
    backgroundColor: Colors.primary.medium,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.utility.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
    marginBottom: 4,
  },
  historyAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyDate: {
    fontSize: 12,
    color: Colors.text.gray,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.primary.medium,
    borderRadius: 16,
    marginBottom: 24,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.white,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: Colors.action.blue.medium,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: Colors.text.white,
    fontWeight: '600',
  },
});
