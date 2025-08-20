'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon, VercelIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { type VisibilityType, VisibilitySelector } from './visibility-selector';
import type { Session } from 'next-auth';
import { SidebarUserNav } from './sidebar-user-nav';
import { LanguageSwitcher } from './language-switcher';
import { useTranslation } from '@/hooks/use-translation';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { t } = useTranslation();

  const { width: windowWidth } = useWindowSize();

  return (
    <>
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200">
        {t('demo.banner')}
      </div>
      <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
        {/* <SidebarToggle /> */}

        <div className="flex items-center gap-2">
          {session.user && <SidebarUserNav user={session.user} />}
          {/* Left side - New Chat Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="md:px-2 px-2 md:h-fit"
                onClick={() => {
                  router.push('/');
                  router.refresh();
                }}
              >
                <PlusIcon />
                <span className="md:sr-only">{t('chat.newChat')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('chat.newChat')}</TooltipContent>
          </Tooltip>
        </div>

        {/* {!isReadonly && (
          <ModelSelector
            session={session}
            selectedModelId={selectedModelId}
            className="order-1 md:order-2"
          />
        )}

        {!isReadonly && (
          <VisibilitySelector
            chatId={chatId}
            selectedVisibilityType={selectedVisibilityType}
            className="order-1 md:order-3"
          />
        )} */}

        {/* Spacer to push right side items to the end */}
        <div className="flex-1" />

        {/* Right side - Language Switcher and User Nav */}
        <LanguageSwitcher />
      </header>
    </>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
