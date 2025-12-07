import React, { useState } from 'react';
import { X, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const UpdateUserModal = ({ isOpen, onClose, isDarkMode }) => {
    const { user, updateUser } = useAuth();

    const [formData, setFormData] = useState({
        email: user?.email || '',
        newPassword: '',
        confirmPassword: '',
        currentPassword: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validações
        if (!formData.currentPassword) {
            setError('Senha atual é obrigatória para confirmar as alterações');
            return;
        }

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (formData.newPassword && formData.newPassword.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const updateData = {
                userId: user.id,
                currentPassword: formData.currentPassword,
                email: formData.email !== user.email ? formData.email : undefined,
                newPassword: formData.newPassword || undefined
            };

            const response = await api.updateUser(updateData);

            if (response.success) {
                setSuccess('Dados atualizados com sucesso!');

                // Atualizar contexto do usuário
                if (updateData.email) {
                    updateUser({ ...user, email: updateData.email });
                }

                // Fechar modal após 2 segundos
                setTimeout(() => {
                    onClose();
                    setFormData({
                        email: user?.email || '',
                        newPassword: '',
                        confirmPassword: '',
                        currentPassword: ''
                    });
                    setSuccess('');
                }, 2000);
            }
        } catch (err) {
            setError(err.message || 'Erro ao atualizar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            email: user?.email || '',
            newPassword: '',
            confirmPassword: '',
            currentPassword: ''
        });
        setError('');
        setSuccess('');
        onClose();
    };

    const theme = {
        overlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, backdropFilter: 'blur(4px)'
        },
        modal: {
            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
            borderRadius: '12px',
            padding: '2rem',
            width: '90%',
            maxWidth: '450px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
        },
        title: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: isDarkMode ? '#f1f5f9' : '#1e293b'
        },
        closeBtn: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            padding: '4px',
            borderRadius: '4px',
            transition: 'background 0.2s'
        },
        form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
        label: {
            fontSize: '0.9rem',
            fontWeight: '500',
            color: isDarkMode ? '#cbd5e1' : '#475569',
            marginBottom: '0.25rem'
        },
        inputContainer: { position: 'relative' },
        input: {
            width: '100%',
            padding: '0.75rem',
            paddingRight: '2.5rem',
            borderRadius: '6px',
            border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
            backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
            color: isDarkMode ? '#f1f5f9' : '#1e293b',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'border 0.2s',
            boxSizing: 'border-box'
        },
        eyeButton: {
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: isDarkMode ? '#64748b' : '#94a3b8',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
        },
        alert: {
            padding: '0.75rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
        },
        errorAlert: {
            backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2',
            color: isDarkMode ? '#fecaca' : '#dc2626',
            border: `1px solid ${isDarkMode ? '#991b1b' : '#fecaca'}`
        },
        successAlert: {
            backgroundColor: isDarkMode ? '#14532d' : '#dcfce7',
            color: isDarkMode ? '#86efac' : '#16a34a',
            border: `1px solid ${isDarkMode ? '#166534' : '#bbf7d0'}`
        },
        submitBtn: {
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
        },
        divider: {
            height: '1px',
            backgroundColor: isDarkMode ? '#334155' : '#e2e8f0',
            margin: '1rem 0'
        },
        hint: {
            fontSize: '0.8rem',
            color: isDarkMode ? '#64748b' : '#94a3b8',
            marginTop: '0.25rem'
        }
    };

    return (
        <div style={theme.overlay} onClick={handleClose}>
            <div style={theme.modal} onClick={(e) => e.stopPropagation()}>
                <div style={theme.header}>
                    <h2 style={theme.title}>Alterar Dados</h2>
                    <button
                        onClick={handleClose}
                        style={theme.closeBtn}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form style={theme.form} onSubmit={handleSubmit}>
                    {/* Email */}
                    <div>
                        <label style={theme.label}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={theme.input}
                            required
                        />
                    </div>

                    <div style={theme.divider}></div>

                    {/* Nova Senha */}
                    <div>
                        <label style={theme.label}>Nova Senha (opcional)</label>
                        <div style={theme.inputContainer}>
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                style={theme.input}
                                placeholder="Deixe em branco para manter a atual"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('new')}
                                style={theme.eyeButton}
                            >
                                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p style={theme.hint}>Mínimo de 6 caracteres</p>
                    </div>

                    {/* Confirmar Nova Senha */}
                    {formData.newPassword && (
                        <div>
                            <label style={theme.label}>Confirmar Nova Senha</label>
                            <div style={theme.inputContainer}>
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    style={theme.input}
                                    required={!!formData.newPassword}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    style={theme.eyeButton}
                                >
                                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={theme.divider}></div>

                    {/* Senha Atual (Confirmação) */}
                    <div>
                        <label style={theme.label}>Senha Atual *</label>
                        <div style={theme.inputContainer}>
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                style={theme.input}
                                required
                                placeholder="Digite sua senha atual para confirmar"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('current')}
                                style={theme.eyeButton}
                            >
                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p style={theme.hint}>Necessária para confirmar as alterações</p>
                    </div>

                    {/* Alertas */}
                    {error && (
                        <div style={{ ...theme.alert, ...theme.errorAlert }}>
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div style={{ ...theme.alert, ...theme.successAlert }}>
                            <AlertCircle size={18} />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Botão Submit */}
                    <button
                        type="submit"
                        style={theme.submitBtn}
                        disabled={loading}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#2563eb')}
                        onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#3b82f6')}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Atualizando...
                            </>
                        ) : (
                            'Alterar Dados'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateUserModal;
