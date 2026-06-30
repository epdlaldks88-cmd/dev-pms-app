import React, { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LoadingView } from "./LoadingView";
import { ErrorView } from "./ErrorView";
import { EmptyState } from "./EmptyState";

interface ListStateViewProps {
  loading: boolean;
  error: boolean | string | null;
  isEmpty: boolean;
  onRetry?: () => void;

  // Empty 상태 커스터마이즈
  emptyIcon?: keyof typeof Ionicons.glyphMap;
  emptyEmoji?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;

  // 로딩 메시지
  loadingMessage?: string;

  /** 정상 상태일 때 렌더할 children */
  children: ReactNode;
}

export const ListStateView: React.FC<ListStateViewProps> = ({
  loading,
  error,
  isEmpty,
  onRetry,
  emptyIcon,
  emptyEmoji,
  emptyTitle = "표시할 항목이 없습니다",
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  loadingMessage,
  children,
}) => {
  if (loading) {
    return <LoadingView message={loadingMessage} />;
  }

  if (error) {
    return (
      <ErrorView
        description={
          typeof error === "string"
            ? error
            : "네트워크 상태를 확인하고 다시 시도해주세요."
        }
        onRetry={onRetry}
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        emoji={emptyEmoji}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return <>{children}</>;
};
