// src/components/CommentsModal.tsx
'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { Lead } from '@/app/dashboard/page'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { User } from '@supabase/supabase-js'

type Comment = {
  id: number;
  created_at: string;
  comentario: string;
  usuario_email: string;
};

type CommentsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
};

export default function CommentsModal({ isOpen, onClose, lead }: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      if (isOpen && lead) {
        setIsLoading(true);
        setError(null);

        // Obtenemos el usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Obtenemos los comentarios
        const { data, error } = await supabase
          .from('comentarios_lead')
          .select('id, created_at, comentario, profiles:usuario_id(users:auth_users(email))')
          .eq('lead_id', lead.id)
          .order('created_at', { ascending: true }); // Ascendente para mostrar los más antiguos primero

        if (error) {
          setError("No se pudieron cargar los comentarios.");
        } else {
            // @ts-ignore
          const formattedComments = data.map(c => ({
            id: c.id, created_at: c.created_at, comentario: c.comentario,
            // @ts-ignore
            usuario_email: c.profiles?.users?.email || 'Usuario desconocido'
          }));
          setComments(formattedComments);
        }
        setIsLoading(false);
      }
    }
    fetchData();
  }, [isOpen, lead]);

  const handleSubmitComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || !lead) return;

    setIsSubmitting(true);
    const commentToInsert = {
      lead_id: lead.id,
      usuario_id: currentUser.id,
      comentario: newComment.trim(),
    };

    const { data, error } = await supabase
      .from('comentarios_lead')
      .insert(commentToInsert)
      .select()
      .single();

    if (error) {
      setError("No se pudo guardar el comentario.");
    } else {
      // Actualización optimista de la UI
      const newCommentForState: Comment = {
        ...data,
        usuario_email: currentUser.email || 'Tú',
      };
      setComments(prev => [...prev, newCommentForState]);
      setNewComment('');
    }
    setIsSubmitting(false);
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl transform transition-all duration-300">
        <button onClick={onClose} className="absolute top-3 right-3 rounded-full p-1 text-gray-500 hover:bg-gray-200">&times;</button>
        <h2 className="text-xl font-bold text-gray-800">Comentarios para: <span className="text-indigo-600">{lead.nombre || lead.email}</span></h2>

        <div className="mt-6 max-h-72 space-y-4 overflow-y-auto pr-2">
          {isLoading && <p>Cargando comentarios...</p>}
          {!isLoading && comments.length === 0 && <p className="py-8 text-center text-gray-500">No hay comentarios para este lead.</p>}
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-md bg-gray-50 p-3">
              <p className="text-sm text-gray-800">{comment.comentario}</p>
              <div className="mt-2 text-right text-xs text-gray-500">
                <strong>{comment.usuario_email}</strong> - <span>{format(new Date(comment.created_at), "d MMM yyyy, HH:mm", { locale: es })}</span>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmitComment} className="mt-4 border-t pt-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un nuevo comentario..."
            className="w-full rounded-md border-gray-300 text-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
            disabled={isSubmitting}
          />
          <div className="mt-2 flex justify-end">
            <button type="submit" disabled={isSubmitting || !newComment.trim()} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50">
              {isSubmitting ? 'Guardando...' : 'Añadir Comentario'}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
}
