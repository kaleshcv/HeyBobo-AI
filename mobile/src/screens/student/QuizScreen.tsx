import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { useRoute } from '@react-navigation/native';
import { Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useQuiz, useSubmitQuiz } from '@/hooks/useQuiz';
import T from '@/theme'

;

export function QuizScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const route = useRoute();
  const { quizId } = route.params as { quizId: string };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const { data: quiz, isLoading } = useQuiz(quizId);
  const { mutate: submitQuiz, isPending: isSubmitting } = useSubmitQuiz();

  useEffect(() => {
    if (quiz?.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60);
    }
  }, [quiz?.timeLimit]);

  useEffect(() => {
    if (timeLeft <= 0 || !quiz) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quiz]);

  const currentQuestion = quiz?.questions?.[currentQuestionIndex];

  const handleSelectAnswer = (optionId: string) => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const answers: Record<string, string | string[]> = {};
    quiz?.questions?.forEach((q: any) => {
      if (selectedAnswers[q.id]) answers[q.id] = selectedAnswers[q.id];
    });

    submitQuiz(
      { quizId, answers },
      {
        onSuccess: (result) => {
          const calculatedScore = result.score || 0;
          setScore(calculatedScore);
          setShowResults(true);
        },
      }
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isAnswered = currentQuestion ? !!selectedAnswers[currentQuestion.id] : false;
  const isLastQuestion = currentQuestionIndex === (quiz?.questions?.length || 0) - 1;

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={T.primary2} />
      </View>
    );
  }

  if (showResults) {
    const passPercentage = quiz?.passingScore || 70;
    const isPassed = score >= passPercentage;

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quiz Complete</Text>
        </View>

        <View style={styles.resultsContainer}>
          <View
            style={[
              styles.resultsBadge,
              { backgroundColor: isPassed ? T.green : T.red },
            ]}
          >
            <Ionicons
              name={isPassed ? 'checkmark-circle' : 'close-circle'}
              size={64}
              color="#fff"
            />
          </View>

          <Text style={styles.resultStatus}>
            {isPassed ? 'Congratulations!' : 'Keep Trying!'}
          </Text>

          <Card padding="lg" style={{ marginVertical: 24 }}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Your Score</Text>
              <Text style={styles.scoreValue}>{Math.round(score)}%</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Questions</Text>
                <Text style={styles.statValue}>{quiz?.questions?.length}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Correct</Text>
                <Text style={[styles.statValue, { color: T.green }]}>
                  {Math.round((score / 100) * (quiz?.questions?.length || 0))}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Passing</Text>
                <Text style={styles.statValue}>{quiz?.passingScore}%</Text>
              </View>
            </View>
          </Card>

          <Button
            title={isPassed ? 'Continue Learning' : 'Retake Quiz'}
            onPress={() => {
              if (!isPassed) {
                setCurrentQuestionIndex(0);
                setSelectedAnswers({});
                setShowResults(false);
                setScore(0);
              } else {
                navigation.goBack();
              }
            }}
            fullWidth
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={T.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{quiz?.title}</Text>
        <View style={styles.timer}>
          <Ionicons name="time" size={18} color={T.red} />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentQuestionIndex + 1) / (quiz?.questions?.length || 1)) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {quiz?.questions?.length}
        </Text>
      </View>

      {/* Question */}
      <View style={styles.content}>
        <Card padding="lg">
          <Text style={styles.questionText}>{currentQuestion?.question}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion?.options?.map((option: any) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.option,
                  currentQuestion && selectedAnswers[currentQuestion.id] === option.id &&
                    styles.optionSelected,
                ]}
                onPress={() => handleSelectAnswer(option.id)}
              >
                <View
                  style={[
                    styles.optionRadio,
                    currentQuestion && selectedAnswers[currentQuestion.id] === option.id &&
                      styles.optionRadioSelected,
                  ]}
                >
                  {currentQuestion && selectedAnswers[currentQuestion.id] === option.id && (
                    <View style={styles.optionRadioInner} />
                  )}
                </View>
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <Button
            title="Previous"
            variant="outline"
            onPress={handlePrevious}
            fullWidth
            disabled={currentQuestionIndex === 0}
          />

          <Button
            title={isLastQuestion ? 'Submit' : 'Next'}
            onPress={isLastQuestion ? handleSubmit : handleNext}
            loading={isSubmitting}
            disabled={!isAnswered}
            fullWidth
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: T.border2,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: T.text,
    marginHorizontal: 12,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${T.red}15`,
    borderRadius: 6,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: T.red,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: T.border2,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: T.primary2,
  },
  progressText: {
    fontSize: 12,
    color: T.muted,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: T.text,
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: T.border2,
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  optionSelected: {
    borderColor: T.primary2,
    backgroundColor: `${T.primary2}08`,
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: T.border2,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    borderColor: T.primary2,
  },
  optionRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.primary2,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: T.text,
    lineHeight: 20,
  },
  navigationContainer: {
    gap: 12,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  resultsBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  resultStatus: {
    fontSize: 24,
    fontWeight: '700',
    color: T.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  scoreRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    color: T.muted,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: T.primary2,
  },
  divider: {
    height: 1,
    backgroundColor: T.border2,
    marginVertical: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: T.muted,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: T.text,
  },
});
