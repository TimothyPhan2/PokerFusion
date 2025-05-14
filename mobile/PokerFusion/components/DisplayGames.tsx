import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useCallback, memo, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useGameStore } from '../stores/game';
import { GameController } from "@/controllers/game";
import { useAuthStore } from '@/stores/auth';
import Colors from '../constants/Colors';
// Define the game item type
type GameItem = {
  gameId: string;
  currentPlayers: number;
  maxPlayers: number;
};
const getRandomSubset = (array: any, size: number | undefined) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
};
// Memoized game item component
const GameItemComponent = memo(({
  item,
  onJoin
}: {
  item: GameItem;
  onJoin: (gameId: string) => void
}) => {
  return (
    <View style={styles.gameItemCard}>
      <View style={styles.gameItemHeader}>
        <Text style={styles.gameIcon}>🎲</Text>
        <Text style={styles.gameIdText}>Game ID: <Text style={styles.gameIdValue}>{item.gameId}</Text></Text>
      </View>
      <Text style={styles.playersText}>Players: <Text style={styles.playersCount}>{item.currentPlayers}</Text>/<Text style={styles.playersMax}>{item.maxPlayers}</Text></Text>
      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => onJoin(item.gameId)}
        activeOpacity={0.8}
      >
        <Text style={styles.joinButtonText}>Join Game</Text>
      </TouchableOpacity>
    </View>
  );
});

const DisplayGames = () => {
  const router = useRouter();
  const {
    publicGames,
    publicLoading,
    publicError,
    getPublicGames,
  } = useGameStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const username = isAuthenticated.user?.username;
  const randomGames = useMemo(() => getRandomSubset(publicGames, 4), [publicGames]);

  useEffect(() => {
    getPublicGames();
  }, [getPublicGames]);

  // Memoize the join game handler
  const handleJoinGame = useCallback((gameId: string) => {
    console.log('Attempting to join game:', gameId);
    GameController.handleJoinGame(gameId, username!);
    router.push({ pathname: '/(tabs)/playgame', params: { gameId } });
  }, [username]);

  // Memoize the key extractor
  const keyExtractor = useCallback((item: GameItem) => item.gameId, []);

  // Memoize the render item function
  const renderItem = useCallback(({ item }: { item: GameItem }) => (
    <GameItemComponent item={item} onJoin={handleJoinGame} />
  ), [handleJoinGame]);

  if (publicLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.action.blue.medium} />
        <Text style={styles.loadingText}>Loading games...</Text>
      </View>
    );
  }

  if (publicError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>❌</Text>
        <Text style={styles.errorText}>{publicError}</Text>
        <TouchableOpacity onPress={getPublicGames} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!publicGames || publicGames.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyEmoji}>😴</Text>
        <Text style={styles.emptyText}>No games available.</Text>
        <TouchableOpacity onPress={getPublicGames} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Public Games</Text>
      <View style={styles.divider} />
      <FlatList
        contentContainerStyle={styles.listContent}
        data={randomGames}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshing={publicLoading}
        onRefresh={getPublicGames}
        windowSize={5}
        maxToRenderPerBatch={5}
        initialNumToRender={4}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.table.medium,
    width: '100%',
    paddingBottom:8
  },
  listContent: {
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.table.medium,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: Colors.action.gold.medium,
    letterSpacing: 1,
  },
  divider: {
    height: 2,
    backgroundColor: Colors.primary.light,
    marginVertical: 10,
    borderRadius: 2,
    width: '60%',
    alignSelf: 'center',
    opacity: 0.2,
  },
  gameItemCard: {
    backgroundColor: Colors.primary.light,
    padding: 20,
    marginBottom: 18,
    borderRadius: 14,
    shadowColor: Colors.utility.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.utility.border,
  },
  gameItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  gameIdText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.text.light,
  },
  gameIdValue: {
    color: Colors.accent.cyan.medium,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  playersText: {
    fontSize: 15,
    color: Colors.text.gray,
    marginBottom: 10,
  },
  playersCount: {
    color: Colors.action.green.medium,
    fontWeight: 'bold',
  },
  playersMax: {
    color: Colors.text.gray,
    fontWeight: 'bold',
  },
  joinButton: {
    marginTop: 10,
    backgroundColor: Colors.action.blue.medium,
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: Colors.utility.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  joinButtonText: {
    color: Colors.text.white,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  errorText: {
    color: Colors.action.red.medium,
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: Colors.action.gold.medium,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 7,
    alignItems: 'center',
  },
  retryButtonText: {
    color: Colors.primary.dark,
    fontWeight: 'bold',
    fontSize: 15,
  },
  loadingText: {
    color: Colors.text.light,
    fontSize: 16,
    marginTop: 8,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.text.gray,
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
});

export default DisplayGames;